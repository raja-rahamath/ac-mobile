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
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../../src/constants/theme';
import { API_CONFIG } from '../../../src/constants/api';
import {
  getJobById,
  clockIn,
  clockOut,
  putOnHold,
  resumeWork,
  addItem,
  uploadPhoto,
  getPhotos,
  getStatusInfo,
} from '../../../src/services/jobService';
import type { WorkOrder, WorkOrderItem, WorkOrderPhoto } from '../../../src/types';
import { Timer } from '../../../src/components/Timer';
import { PhotoCapture, CapturedPhoto } from '../../../src/components/PhotoCapture';
import { MaterialsList, MaterialItem } from '../../../src/components/MaterialsList';
import { useAuth } from '../../../src/contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WorkScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const employeeId = user?.employee?.id;
  const isDark = colorScheme === 'dark';

  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const notesInputRef = useRef<View>(null);

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
  const [uploadedPhotos, setUploadedPhotos] = useState<WorkOrderPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<WorkOrderPhoto | null>(null);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);

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

      // Fetch uploaded photos
      try {
        const existingPhotos = await getPhotos(id);
        setUploadedPhotos(existingPhotos || []);
      } catch (photoErr) {
        console.log('Error fetching photos:', photoErr);
        setUploadedPhotos([]);
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
      // Refresh uploaded photos list
      const existingPhotos = await getPhotos(job.id);
      setUploadedPhotos(existingPhotos || []);
    } catch (err: any) {
      console.error('Error uploading photos:', err);
      Alert.alert('Error', err.message || 'Failed to upload photos');
    } finally {
      setIsUploading(false);
    }
  };

  // Scroll to notes input when focused
  const handleNotesFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  // Open photo viewer
  const handlePhotoPress = (photo: WorkOrderPhoto) => {
    setSelectedPhoto(photo);
    setShowPhotoViewer(true);
  };

  // Get photo type label and color
  const getPhotoTypeInfo = (type: string) => {
    const typeMap: Record<string, { label: string; color: string }> = {
      BEFORE: { label: 'Before', color: '#3b82f6' },
      DURING: { label: 'During', color: '#f59e0b' },
      AFTER: { label: 'After', color: '#22c55e' },
      ISSUE: { label: 'Issue', color: '#ef4444' },
      OTHER: { label: 'Other', color: '#6b7280' },
    };
    return typeMap[type] || { label: type, color: '#6b7280' };
  };

  // Get full photo URL (handle relative URLs)
  const getPhotoUrl = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Prepend API base URL for relative paths
    return `${API_CONFIG.BASE_URL}${url}`;
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
    <KeyboardAvoidingView
      style={[styles.container, dynamicStyles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        keyboardShouldPersistTaps="handled"
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

        {/* Uploaded Photos */}
        {uploadedPhotos.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.uploadedPhotosContainer, dynamicStyles.card]}>
              <Text style={[styles.sectionTitle, dynamicStyles.text]}>
                Uploaded Photos ({uploadedPhotos.length})
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.uploadedPhotosScroll}
              >
                {uploadedPhotos.map((photo) => {
                  const typeInfo = getPhotoTypeInfo(photo.photoType);
                  return (
                    <TouchableOpacity
                      key={photo.id}
                      style={styles.uploadedPhotoItem}
                      onPress={() => handlePhotoPress(photo)}
                    >
                      <Image
                        source={{ uri: getPhotoUrl(photo.url) }}
                        style={styles.uploadedPhotoThumb}
                        resizeMode="cover"
                      />
                      <View style={[styles.photoTypeBadge, { backgroundColor: typeInfo.color }]}>
                        <Text style={styles.photoTypeBadgeText}>{typeInfo.label}</Text>
                      </View>
                      {photo.caption && (
                        <Text style={[styles.photoCaption, dynamicStyles.textMuted]} numberOfLines={1}>
                          {photo.caption}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Notes */}
        <View style={styles.section}>
          <View style={[styles.notesContainer, dynamicStyles.card]}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Work Notes</Text>
            <TextInput
              style={[styles.notesInput, dynamicStyles.input]}
              value={notes}
              onChangeText={setNotes}
              onFocus={handleNotesFocus}
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

      {/* Photo Viewer Modal */}
      <Modal
        visible={showPhotoViewer}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoViewer(false)}
      >
        <View style={styles.photoViewerContainer}>
          <TouchableOpacity
            style={styles.photoViewerClose}
            onPress={() => setShowPhotoViewer(false)}
          >
            <Ionicons name="close" size={28} color={colors.white} />
          </TouchableOpacity>
          {selectedPhoto && (
            <>
              <Image
                source={{ uri: getPhotoUrl(selectedPhoto.url) }}
                style={styles.photoViewerImage}
                resizeMode="contain"
              />
              <View style={styles.photoViewerInfo}>
                <View style={[styles.photoViewerTypeBadge, { backgroundColor: getPhotoTypeInfo(selectedPhoto.photoType).color }]}>
                  <Text style={styles.photoViewerTypeBadgeText}>
                    {getPhotoTypeInfo(selectedPhoto.photoType).label}
                  </Text>
                </View>
                {selectedPhoto.caption && (
                  <Text style={styles.photoViewerCaption}>{selectedPhoto.caption}</Text>
                )}
                <Text style={styles.photoViewerDate}>
                  {new Date(selectedPhoto.takenAt).toLocaleString()}
                </Text>
              </View>
            </>
          )}
        </View>
      </Modal>

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
    </KeyboardAvoidingView>
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
  // Uploaded Photos styles
  uploadedPhotosContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  uploadedPhotosScroll: {
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  uploadedPhotoItem: {
    width: 100,
    marginRight: spacing.sm,
  },
  uploadedPhotoThumb: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    backgroundColor: colors.border,
  },
  photoTypeBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  photoTypeBadgeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  photoCaption: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  // Photo Viewer Modal styles
  photoViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoViewerClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: spacing.sm,
  },
  photoViewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  photoViewerInfo: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: spacing.lg,
  },
  photoViewerTypeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  photoViewerTypeBadgeText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  photoViewerCaption: {
    color: colors.white,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  photoViewerDate: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: fontSize.sm,
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
