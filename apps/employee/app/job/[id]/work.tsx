import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../../src/constants/theme';
import {
  getJobById,
  clockIn,
  clockOut,
  putOnHold,
  resumeWork,
  addItem,
  uploadPhoto,
  getStatusInfo,
} from '../../../src/services/jobService';
import type { WorkOrder, WorkOrderItem } from '../../../src/types';
import { Timer } from '../../../src/components/Timer';
import { PhotoCapture, CapturedPhoto } from '../../../src/components/PhotoCapture';
import { MaterialsList, MaterialItem } from '../../../src/components/MaterialsList';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function WorkScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const employeeId = user?.employee?.id;
  const isDark = colorScheme === 'dark';

  const [job, setJob] = useState<WorkOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Work state
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [totalWorkSeconds, setTotalWorkSeconds] = useState(0);
  const [notes, setNotes] = useState('');

  // Photos state
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Materials state
  const [materials, setMaterials] = useState<MaterialItem[]>([]);

  const dynamicStyles = {
    container: { backgroundColor: isDark ? colors.backgroundDark : colors.background },
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    card: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
    input: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
      color: isDark ? colors.textDark : colors.text,
    },
  };

  const fetchJob = async () => {
    if (!id) return;

    try {
      setError(null);
      const data = await getJobById(id);
      setJob(data);

      // Load existing items
      if (data.items) {
        setMaterials(
          data.items.map((item: WorkOrderItem) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice || 0,
            itemType: item.itemType || 'MATERIAL',
          }))
        );
      }

      // Check if already clocked in - get from labor entries
      if (data.status === 'IN_PROGRESS' || data.status === 'ON_HOLD') {
        // Find active labor entry (no clock out)
        const activeLabor = data.laborEntries?.find((entry: any) => !entry.clockOutAt);
        if (activeLabor) {
          setIsClockedIn(true);
          setClockInTime(activeLabor.clockInAt);

          // If there's prior accumulated time, we could add it here
          // For now, the timer will calculate from clockInAt
        }

        if (data.status === 'ON_HOLD') {
          setIsPaused(true);
        }
      }
    } catch (err: any) {
      console.error('Error fetching job:', err);
      setError(err.message || 'Failed to load job details');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchJob();
    }, [id])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJob();
  }, [id]);

  const handleClockIn = async () => {
    if (!job || !employeeId) {
      Alert.alert('Error', 'Employee ID not found');
      return;
    }

    setIsUpdating(true);
    try {
      await clockIn(job.id, { employeeId });
      // Use current time as clock-in time (we just clocked in)
      const now = new Date().toISOString();
      setIsClockedIn(true);
      setClockInTime(now);
      setIsPaused(false);
      Alert.alert('Clocked In', 'Timer started');
    } catch (err: any) {
      console.error('Error clocking in:', err);
      Alert.alert('Error', err.message || 'Failed to clock in');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClockOut = async () => {
    if (!job || !employeeId) {
      Alert.alert('Error', 'Employee ID not found');
      return;
    }

    Alert.alert(
      'Clock Out',
      'Are you sure you want to clock out? This will stop the timer.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clock Out',
          onPress: async () => {
            setIsUpdating(true);
            try {
              await clockOut(job.id, { employeeId, notes });
              setIsClockedIn(false);
              setClockInTime(null);
              Alert.alert('Clocked Out', 'Work session recorded');
              // Refresh job to get updated data
              fetchJob();
            } catch (err: any) {
              console.error('Error clocking out:', err);
              Alert.alert('Error', err.message || 'Failed to clock out');
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handlePause = async () => {
    if (!job) return;

    setIsUpdating(true);
    try {
      await putOnHold(job.id, { reason: 'Paused by technician' });
      setIsPaused(true);
      Alert.alert('Paused', 'Work has been paused');
      fetchJob();
    } catch (err: any) {
      console.error('Error pausing:', err);
      Alert.alert('Error', err.message || 'Failed to pause work');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResume = async () => {
    if (!job) return;

    setIsUpdating(true);
    try {
      await resumeWork(job.id, { notes: 'Resumed by technician' });
      setIsPaused(false);
      Alert.alert('Resumed', 'Work has been resumed');
      fetchJob();
    } catch (err: any) {
      console.error('Error resuming:', err);
      Alert.alert('Error', err.message || 'Failed to resume work');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddPhoto = (photo: CapturedPhoto) => {
    setPhotos((prev) => [...prev, photo]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadPhotos = async () => {
    if (!job || photos.length === 0) return;

    if (!employeeId) {
      Alert.alert('Error', 'Employee ID not found');
      return;
    }

    setIsUploading(true);
    try {
      for (const photo of photos) {
        await uploadPhoto(
          job.id,
          employeeId,
          {
            uri: photo.uri,
            type: photo.type,
            name: photo.name,
          },
          photo.photoType
        );
      }
      Alert.alert('Success', `${photos.length} photo(s) uploaded successfully`);
      setPhotos([]);
    } catch (err: any) {
      console.error('Error uploading photos:', err);
      Alert.alert('Error', err.message || 'Failed to upload photos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddMaterial = async (item: Omit<MaterialItem, 'id'>) => {
    if (!job) return;

    try {
      const result = await addItem(job.id, item);
      setMaterials((prev) => [...prev, { ...item, id: result.id }]);
    } catch (err: any) {
      console.error('Error adding item:', err);
      Alert.alert('Error', err.message || 'Failed to add item');
    }
  };

  const handleRemoveMaterial = (index: number) => {
    // Note: In a real app, you would also call the API to remove the item
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCompleteWork = () => {
    if (!job) return;

    // Check if clocked in
    if (isClockedIn) {
      Alert.alert('Clock Out First', 'Please clock out before completing the work.');
      return;
    }

    // Check if photos uploaded
    if (photos.length > 0) {
      Alert.alert(
        'Upload Photos',
        'You have unsaved photos. Would you like to upload them before completing?',
        [
          { text: 'Upload & Continue', onPress: () => handleUploadPhotos().then(() => router.push(`/job/${job.id}/complete`)) },
          { text: 'Skip', onPress: () => router.push(`/job/${job.id}/complete`) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    router.push(`/job/${job.id}/complete`);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, dynamicStyles.container]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, dynamicStyles.textMuted]}>Loading...</Text>
      </View>
    );
  }

  if (error || !job) {
    return (
      <View style={[styles.errorContainer, dynamicStyles.container]}>
        <Ionicons name="alert-circle" size={64} color={colors.error} />
        <Text style={[styles.errorTitle, dynamicStyles.text]}>Failed to Load</Text>
        <Text style={[styles.errorMessage, dynamicStyles.textMuted]}>
          {error || 'Job not found'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchJob}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusInfo = getStatusInfo(job.status);

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Job Header */}
        <View style={[styles.jobHeader, dynamicStyles.card]}>
          <View style={styles.jobHeaderContent}>
            <Text style={[styles.jobTitle, dynamicStyles.text]} numberOfLines={1}>
              {job.title || job.serviceRequest?.title || 'Work Order'}
            </Text>
            {job.workOrderNo && (
              <Text style={[styles.jobNumber, dynamicStyles.textMuted]}>#{job.workOrderNo}</Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        {/* Timer */}
        <View style={styles.section}>
          <Timer
            isRunning={isClockedIn && !isPaused}
            startTime={clockInTime}
            totalSeconds={totalWorkSeconds}
            isClockedIn={isClockedIn}
            isPaused={isPaused}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            onPause={handlePause}
            onResume={handleResume}
            isDark={isDark}
          />
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <PhotoCapture
            photos={photos}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
            isUploading={isUploading}
            isDark={isDark}
          />
          {photos.length > 0 && (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUploadPhotos}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={20} color={colors.white} />
                  <Text style={styles.uploadButtonText}>Upload {photos.length} Photo(s)</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Materials */}
        <View style={styles.section}>
          <MaterialsList
            items={materials}
            onAddItem={handleAddMaterial}
            onRemoveItem={handleRemoveMaterial}
            isDark={isDark}
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <View style={[styles.notesContainer, dynamicStyles.card]}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Work Notes</Text>
            <TextInput
              style={[styles.notesInput, dynamicStyles.input]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about the work performed..."
              placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, dynamicStyles.card]}>
        <TouchableOpacity
          style={[
            styles.completeButton,
            (isUpdating || isClockedIn) && styles.completeButtonDisabled,
          ]}
          onPress={handleCompleteWork}
          disabled={isUpdating || isClockedIn}
        >
          {isUpdating ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-done" size={20} color={colors.white} />
              <Text style={styles.completeButtonText}>
                {isClockedIn ? 'Clock Out First' : 'Complete Work'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.lg,
  },
  errorMessage: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  jobHeaderContent: {
    flex: 1,
  },
  jobTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  jobNumber: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  section: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  uploadButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  notesContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 100,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  completeButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  completeButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
