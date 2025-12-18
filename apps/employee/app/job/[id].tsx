import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';
import { API_CONFIG } from '../../src/constants/api';
import {
  getJobById,
  startRoute,
  markArrived,
  startWork,
  getStatusInfo,
  getPriorityInfo,
} from '../../src/services/jobService';
import { useAuth } from '../../src/contexts/AuthContext';
import type { WorkOrder, WorkOrderStatus } from '../../src/types';

const STATUS_FLOW: WorkOrderStatus[] = [
  'PENDING',
  'SCHEDULED',
  'CONFIRMED',
  'EN_ROUTE',
  'ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
];

const STATUS_DISPLAY_FLOW: WorkOrderStatus[] = [
  'CONFIRMED',
  'EN_ROUTE',
  'ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
];

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const employeeId = user?.employee?.id;

  const [job, setJob] = useState<WorkOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dynamicStyles = {
    container: { backgroundColor: isDark ? colors.backgroundDark : colors.background },
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    card: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
  };

  const fetchJob = async () => {
    if (!id) return;

    try {
      setError(null);
      const data = await getJobById(id);
      setJob(data);
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

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  // Helper to format Bahrain-style address for display
  const formatBahrainAddress = () => {
    const sr = job?.serviceRequest;

    // Try Unit -> Building -> Block/Road/Area (new architecture)
    if (sr?.unit?.building) {
      const building = sr.unit.building;
      const parts: string[] = [];

      if (building.buildingNo) parts.push(`Building ${building.buildingNo}`);
      if (building.road?.roadNo) parts.push(`Road ${building.road.roadNo}`);
      if (building.block?.blockNo) parts.push(`Block ${building.block.blockNo}`);

      // Get area name from building or block
      const areaName = building.area?.name || building.block?.area?.name;
      if (areaName) parts.push(areaName);

      if (parts.length > 0) return parts.join(', ');
    }

    // Try legacy Property model
    if (sr?.property) {
      const prop = sr.property;
      // Use the pre-formatted address if available
      if (prop.address) return prop.address;

      // Otherwise build from components
      const parts: string[] = [];
      if (prop.building) parts.push(`Building ${prop.building}`);
      const areaName = prop.areaRef?.name || prop.areaName;
      if (areaName) parts.push(areaName);

      if (parts.length > 0) return parts.join(', ');
    }

    // Fallback to zone name
    return sr?.zone?.name || 'Location TBD';
  };

  // Helper to get address for Google Maps navigation
  type NavData = { type: 'coords'; lat: number; lng: number } | { type: 'address'; address: string } | null;

  const getNavigationAddress = (): NavData => {
    const sr = job?.serviceRequest;

    // Try Unit -> Building (new architecture)
    if (sr?.unit?.building) {
      const building = sr.unit.building;

      // If building has coordinates, use them
      if (building.latitude && building.longitude) {
        return { type: 'coords', lat: building.latitude, lng: building.longitude };
      }

      // Format Bahrain address for Google Maps
      const parts: string[] = [];
      if (building.buildingNo) parts.push(`Building ${building.buildingNo}`);
      if (building.road?.roadNo) parts.push(`Road ${building.road.roadNo}`);
      if (building.block?.blockNo) parts.push(`Block ${building.block.blockNo}`);
      const areaName = building.area?.name || building.block?.area?.name;
      if (areaName) parts.push(areaName);
      parts.push('Bahrain');

      if (parts.length > 1) return { type: 'address', address: parts.join(', ') };
    }

    // Try legacy Property model
    if (sr?.property) {
      const prop = sr.property;

      // If property has coordinates, use them
      if (prop.latitude && prop.longitude) {
        return { type: 'coords', lat: prop.latitude, lng: prop.longitude };
      }

      // Format address
      const parts: string[] = [];
      if (prop.building) parts.push(`Building ${prop.building}`);
      const areaName = prop.areaRef?.name || prop.areaName;
      if (areaName) parts.push(areaName);
      parts.push('Bahrain');

      if (parts.length > 1) return { type: 'address', address: parts.join(', ') };
      if (prop.address) return { type: 'address', address: `${prop.address}, Bahrain` };
    }

    // Try work order property
    if (job?.property) {
      const prop = job.property;
      if (prop.latitude && prop.longitude) {
        return { type: 'coords', lat: prop.latitude, lng: prop.longitude };
      }
      if (prop.address) {
        return { type: 'address', address: `${prop.address}, Bahrain` };
      }
    }

    // Fallback to zone name (least accurate but better than nothing)
    if (sr?.zone?.name) {
      return { type: 'address', address: `${sr.zone.name}, Bahrain` };
    }

    return null;
  };

  const handleNavigate = () => {
    const navData = getNavigationAddress();

    if (!navData) {
      Alert.alert('No Address', 'No address available for navigation');
      return;
    }

    let url: string;
    if (navData.type === 'coords') {
      // Use coordinates for more accurate navigation
      url = `https://www.google.com/maps/dir/?api=1&destination=${navData.lat},${navData.lng}`;
    } else {
      // Use formatted address
      const encodedAddress = encodeURIComponent(navData.address);
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    }

    Linking.openURL(url);
  };

  const handleUpdateStatus = async () => {
    if (!job) return;

    if (!employeeId) {
      Alert.alert('Error', 'Employee information not found. Please log in again.');
      return;
    }

    setIsUpdating(true);
    try {
      let updatedJob: WorkOrder;

      switch (job.status) {
        case 'PENDING':
        case 'SCHEDULED':
        case 'CONFIRMED':
          updatedJob = await startRoute(job.id, { employeeId });
          Alert.alert('Status Updated', 'You are now en route to the customer');
          break;
        case 'EN_ROUTE':
          updatedJob = await markArrived(job.id, { employeeId });
          Alert.alert('Status Updated', 'You have arrived at the location');
          break;
        case 'ARRIVED':
          updatedJob = await startWork(job.id, { employeeId });
          Alert.alert('Status Updated', 'Work has started');
          // Navigate to work screen
          router.push(`/job/${job.id}/work`);
          break;
        case 'IN_PROGRESS':
          // Navigate to work screen to complete
          router.push(`/job/${job.id}/work`);
          return;
        default:
          return;
      }

      setJob(updatedJob);
    } catch (err: any) {
      console.error('Error updating status:', err);
      Alert.alert('Error', err.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusButton = (): { label: string; icon: string } | null => {
    if (!job) return null;

    switch (job.status) {
      case 'PENDING':
      case 'SCHEDULED':
      case 'CONFIRMED':
        return { label: 'Start Route', icon: 'navigate' };
      case 'EN_ROUTE':
        return { label: 'Arrived', icon: 'location' };
      case 'ARRIVED':
        return { label: 'Start Work', icon: 'construct' };
      case 'IN_PROGRESS':
        return { label: 'Continue Work', icon: 'construct' };
      case 'COMPLETED':
        return { label: 'View Invoice', icon: 'receipt' };
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, dynamicStyles.container]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, dynamicStyles.textMuted]}>Loading job details...</Text>
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

  const statusButton = getStatusButton();
  const statusInfo = getStatusInfo(job.status);
  const priorityInfo = getPriorityInfo(job.priority);

  // Get customer from work order or service request
  const customer = job.customer || job.serviceRequest?.customer;
  const customerName = customer
    ? customer.customerType === 'ORGANIZATION'
      ? customer.orgName || 'Unknown Organization'
      : `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown Customer'
    : 'Unknown Customer';

  const customerPhone = customer?.phone || customer?.mobile || '';

  // Get formatted Bahrain address
  const address = formatBahrainAddress();

  // Get service request number
  const requestNo = job.serviceRequest?.requestNo || job.workOrderNo;

  const estimatedDuration = job.estimatedDuration
    ? job.estimatedDuration >= 60
      ? `${Math.floor(job.estimatedDuration / 60)}h ${job.estimatedDuration % 60}m`
      : `${job.estimatedDuration}m`
    : 'TBD';

  // Get current status index for progress display
  const currentStatusIndex = STATUS_DISPLAY_FLOW.indexOf(job.status);
  const effectiveStatusIndex =
    currentStatusIndex >= 0 ? currentStatusIndex : job.status === 'PENDING' || job.status === 'SCHEDULED' ? -1 : 0;

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Stack.Screen
        options={{
          title: 'Service Details',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Status Progress */}
        <View style={[styles.statusProgress, dynamicStyles.card]}>
          {STATUS_DISPLAY_FLOW.slice(0, -1).map((status, index) => {
            const isCompleted = index < effectiveStatusIndex;
            const isCurrent = index === effectiveStatusIndex;

            return (
              <View key={status} style={styles.statusStep}>
                <View
                  style={[
                    styles.statusDot,
                    isCompleted && styles.statusDotCompleted,
                    isCurrent && styles.statusDotCurrent,
                  ]}
                >
                  {isCompleted && <Ionicons name="checkmark" size={12} color={colors.white} />}
                </View>
                <Text
                  style={[
                    styles.statusLabel,
                    dynamicStyles.textMuted,
                    (isCompleted || isCurrent) && { color: colors.primary },
                  ]}
                >
                  {status.replace('_', ' ').charAt(0) + status.replace('_', ' ').slice(1).toLowerCase()}
                </Text>
                {index < STATUS_DISPLAY_FLOW.length - 2 && (
                  <View style={[styles.statusLine, isCompleted && styles.statusLineCompleted]} />
                )}
              </View>
            );
          })}
        </View>

        {/* Job Info */}
        <View style={[styles.card, dynamicStyles.card]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, dynamicStyles.text]}>
              {job.title || job.serviceRequest?.title || 'Work Order'}
            </Text>
            <View style={[styles.priorityBadge, { backgroundColor: priorityInfo.color + '20' }]}>
              <Text style={[styles.priorityText, { color: priorityInfo.color }]}>
                {priorityInfo.label}
              </Text>
            </View>
          </View>

          {requestNo && (
            <Text style={[styles.workOrderNo, dynamicStyles.textMuted]}>#{requestNo}</Text>
          )}

          <Text style={[styles.description, dynamicStyles.textMuted]}>
            {job.description || job.serviceRequest?.description || 'No description provided'}
          </Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={18} color={colors.primary} />
              <Text style={[styles.detailText, dynamicStyles.text]}>
                {job.scheduledDate
                  ? new Date(job.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Not scheduled'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={18} color={colors.primary} />
              <Text style={[styles.detailText, dynamicStyles.text]}>
                {job.scheduledDate
                  ? new Date(job.scheduledDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '--:--'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="hourglass" size={18} color={colors.primary} />
              <Text style={[styles.detailText, dynamicStyles.text]}>{estimatedDuration}</Text>
            </View>
          </View>
        </View>

        {/* Current Status */}
        <View style={[styles.card, dynamicStyles.card]}>
          <View style={styles.currentStatusRow}>
            <View style={[styles.statusIndicator, { backgroundColor: statusInfo.color }]} />
            <View>
              <Text style={[styles.currentStatusLabel, dynamicStyles.textMuted]}>Current Status</Text>
              <Text style={[styles.currentStatusValue, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>Customer Information</Text>
          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Text style={styles.customerAvatarText}>
                {customerName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={[styles.customerName, dynamicStyles.text]}>{customerName}</Text>
              {customerPhone && (
                <Text style={[styles.customerPhone, dynamicStyles.textMuted]}>{customerPhone}</Text>
              )}
            </View>
            <View style={styles.customerActions}>
              {customerPhone && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handleCall(customerPhone)}
                >
                  <Ionicons name="call" size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Property Details */}
          <View style={styles.propertySection}>
            <View style={styles.propertySectionHeader}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <Text style={[styles.propertySectionTitle, dynamicStyles.text]}>Property Location</Text>
            </View>

            {/* Show detailed address components */}
            {(() => {
              const sr = job.serviceRequest;
              const unit = sr?.unit;
              const building = unit?.building;
              const prop = sr?.property;

              // Check if we have unit/building data (new architecture)
              if (building) {
                return (
                  <View style={styles.propertyDetails}>
                    {unit?.flatNumber && (
                      <View style={styles.propertyRow}>
                        <Text style={[styles.propertyLabel, dynamicStyles.textMuted]}>Flat:</Text>
                        <Text style={[styles.propertyValue, dynamicStyles.text]}>{unit.flatNumber}</Text>
                      </View>
                    )}
                    {unit?.floor !== undefined && unit?.floor !== null && (
                      <View style={styles.propertyRow}>
                        <Text style={[styles.propertyLabel, dynamicStyles.textMuted]}>Floor:</Text>
                        <Text style={[styles.propertyValue, dynamicStyles.text]}>{unit.floor}</Text>
                      </View>
                    )}
                    {building.buildingNo && (
                      <View style={styles.propertyRow}>
                        <Text style={[styles.propertyLabel, dynamicStyles.textMuted]}>Building:</Text>
                        <Text style={[styles.propertyValue, dynamicStyles.text]}>{building.buildingNo}</Text>
                      </View>
                    )}
                    {building.road?.roadNo && (
                      <View style={styles.propertyRow}>
                        <Text style={[styles.propertyLabel, dynamicStyles.textMuted]}>Road:</Text>
                        <Text style={[styles.propertyValue, dynamicStyles.text]}>{building.road.roadNo}</Text>
                      </View>
                    )}
                    {building.block?.blockNo && (
                      <View style={styles.propertyRow}>
                        <Text style={[styles.propertyLabel, dynamicStyles.textMuted]}>Block:</Text>
                        <Text style={[styles.propertyValue, dynamicStyles.text]}>{building.block.blockNo}</Text>
                      </View>
                    )}
                    {(building.area?.name || building.block?.area?.name) && (
                      <View style={styles.propertyRow}>
                        <Text style={[styles.propertyLabel, dynamicStyles.textMuted]}>Area:</Text>
                        <Text style={[styles.propertyValue, dynamicStyles.text]}>
                          {building.area?.name || building.block?.area?.name}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              }

              // Fallback to legacy property model
              if (prop) {
                return (
                  <View style={styles.propertyDetails}>
                    {prop.unit && (
                      <View style={styles.propertyRow}>
                        <Text style={[styles.propertyLabel, dynamicStyles.textMuted]}>Flat:</Text>
                        <Text style={[styles.propertyValue, dynamicStyles.text]}>{prop.unit}</Text>
                      </View>
                    )}
                    {prop.floor && (
                      <View style={styles.propertyRow}>
                        <Text style={[styles.propertyLabel, dynamicStyles.textMuted]}>Floor:</Text>
                        <Text style={[styles.propertyValue, dynamicStyles.text]}>{prop.floor}</Text>
                      </View>
                    )}
                    {prop.building && (
                      <View style={styles.propertyRow}>
                        <Text style={[styles.propertyLabel, dynamicStyles.textMuted]}>Building:</Text>
                        <Text style={[styles.propertyValue, dynamicStyles.text]}>{prop.building}</Text>
                      </View>
                    )}
                    {(prop.areaRef?.name || prop.areaName) && (
                      <View style={styles.propertyRow}>
                        <Text style={[styles.propertyLabel, dynamicStyles.textMuted]}>Area:</Text>
                        <Text style={[styles.propertyValue, dynamicStyles.text]}>
                          {prop.areaRef?.name || prop.areaName}
                        </Text>
                      </View>
                    )}
                    {prop.address && (
                      <View style={styles.propertyRow}>
                        <Text style={[styles.propertyLabel, dynamicStyles.textMuted]}>Address:</Text>
                        <Text style={[styles.propertyValue, dynamicStyles.text]}>{prop.address}</Text>
                      </View>
                    )}
                  </View>
                );
              }

              // Fallback to zone
              if (sr?.zone?.name) {
                return (
                  <View style={styles.propertyDetails}>
                    <View style={styles.propertyRow}>
                      <Text style={[styles.propertyLabel, dynamicStyles.textMuted]}>Zone:</Text>
                      <Text style={[styles.propertyValue, dynamicStyles.text]}>{sr.zone.name}</Text>
                    </View>
                  </View>
                );
              }

              return (
                <Text style={[styles.noPropertyText, dynamicStyles.textMuted]}>
                  Location details not available
                </Text>
              );
            })()}
          </View>

          <TouchableOpacity style={styles.navigateButton} onPress={handleNavigate}>
            <Ionicons name="navigate" size={18} color={colors.white} />
            <Text style={styles.navigateButtonText}>Open Navigation</Text>
          </TouchableOpacity>
        </View>

        {/* Service Request Details */}
        {job.serviceRequest && (
          <View style={[styles.card, dynamicStyles.card]}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Service Request</Text>
            {job.serviceRequest.requestNo && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, dynamicStyles.textMuted]}>Request #:</Text>
                <Text style={[styles.detailValue, dynamicStyles.text]}>
                  {job.serviceRequest.requestNo}
                </Text>
              </View>
            )}
            {job.serviceRequest.complaintType && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, dynamicStyles.textMuted]}>Type:</Text>
                <Text style={[styles.detailValue, dynamicStyles.text]}>
                  {job.serviceRequest.complaintType.name}
                </Text>
              </View>
            )}
            {job.serviceRequest.createdAt && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, dynamicStyles.textMuted]}>Created:</Text>
                <Text style={[styles.detailValue, dynamicStyles.text]}>
                  {new Date(job.serviceRequest.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            )}
            {job.serviceRequest.status && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, dynamicStyles.textMuted]}>SR Status:</Text>
                <Text style={[styles.detailValue, dynamicStyles.text]}>
                  {job.serviceRequest.status}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Customer Uploaded Images */}
        {job.serviceRequest?.attachments && job.serviceRequest.attachments.length > 0 && (
          <View style={[styles.card, dynamicStyles.card]}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Customer Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {job.serviceRequest.attachments
                .filter(att => att.fileType.startsWith('image/'))
                .map((attachment) => (
                  <TouchableOpacity
                    key={attachment.id}
                    onPress={() => {
                      const imageUrl = attachment.filePath.startsWith('http')
                        ? attachment.filePath
                        : `${API_CONFIG.BASE_URL}${attachment.filePath}`;
                      Linking.openURL(imageUrl);
                    }}
                  >
                    <Image
                      source={{
                        uri: attachment.filePath.startsWith('http')
                          ? attachment.filePath
                          : `${API_CONFIG.BASE_URL}${attachment.filePath}`,
                      }}
                      style={styles.attachmentImage}
                      resizeMode="cover"
                    />
                    <Text style={[styles.imageCaption, dynamicStyles.textMuted]} numberOfLines={1}>
                      {attachment.fileName}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        )}

        {/* Notes */}
        {(job.notes || job.technicianNotes) && (
          <View style={[styles.card, dynamicStyles.card]}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Notes</Text>
            <View style={[styles.notesBox, { backgroundColor: colors.warning + '10' }]}>
              <Ionicons name="document-text" size={18} color={colors.warning} />
              <Text style={[styles.notesText, dynamicStyles.text]}>
                {job.notes || job.technicianNotes}
              </Text>
            </View>
          </View>
        )}

        {/* Checklist */}
        {job.checklist && job.checklist.length > 0 && (
          <View style={[styles.card, dynamicStyles.card]}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Checklist</Text>
            {job.checklist.map((item, index) => (
              <View key={item.id || index} style={styles.checklistItem}>
                <Ionicons
                  name={item.isCompleted ? 'checkbox' : 'checkbox-outline'}
                  size={20}
                  color={item.isCompleted ? colors.success : colors.primary}
                />
                <Text style={[styles.checklistText, dynamicStyles.text]}>{item.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Items/Materials */}
        {job.items && job.items.length > 0 && (
          <View style={[styles.card, dynamicStyles.card]}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Materials Used</Text>
            {job.items.map((item, index) => (
              <View key={item.id || index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, dynamicStyles.text]}>{item.description}</Text>
                  <Text style={[styles.itemMeta, dynamicStyles.textMuted]}>
                    Qty: {item.quantity} × ${item.unitPrice?.toFixed(2) || '0.00'}
                  </Text>
                </View>
                <Text style={[styles.itemTotal, dynamicStyles.text]}>
                  ${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action */}
      {statusButton && job.status !== 'CANCELLED' && (
        <View style={[styles.bottomAction, dynamicStyles.card]}>
          <TouchableOpacity
            style={[styles.mainActionButton, isUpdating && styles.mainActionButtonDisabled]}
            onPress={handleUpdateStatus}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name={statusButton.icon as any} size={20} color={colors.white} />
                <Text style={styles.mainActionText}>{statusButton.label}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  statusProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  statusStep: {
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDotCompleted: {
    backgroundColor: colors.primary,
  },
  statusDotCurrent: {
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.primary + '40',
  },
  statusLabel: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  statusLine: {
    position: 'absolute',
    top: 12,
    left: '60%',
    right: '-40%',
    height: 2,
    backgroundColor: colors.border,
    zIndex: -1,
  },
  statusLineCompleted: {
    backgroundColor: colors.primary,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    flex: 1,
    paddingRight: spacing.sm,
  },
  workOrderNo: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  priorityText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  description: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: fontSize.sm,
  },
  currentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  currentStatusLabel: {
    fontSize: fontSize.xs,
  },
  currentStatusValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerAvatarText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  customerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  customerName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  customerPhone: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  customerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertySection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  propertySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  propertySectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  propertyDetails: {
    marginLeft: spacing.lg + spacing.sm,
  },
  propertyRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  propertyLabel: {
    fontSize: fontSize.sm,
    width: 70,
  },
  propertyValue: {
    fontSize: fontSize.sm,
    flex: 1,
    fontWeight: fontWeight.medium,
  },
  noPropertyText: {
    fontSize: fontSize.sm,
    marginLeft: spacing.lg + spacing.sm,
    fontStyle: 'italic',
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  navigateButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    width: 80,
  },
  detailValue: {
    fontSize: fontSize.sm,
    flex: 1,
    fontWeight: fontWeight.medium,
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  notesText: {
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: 20,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  checklistText: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '50',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  itemMeta: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  mainActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  mainActionButtonDisabled: {
    opacity: 0.7,
  },
  mainActionText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  imageScroll: {
    marginHorizontal: -spacing.sm,
  },
  attachmentImage: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.sm,
  },
  imageCaption: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    marginHorizontal: spacing.sm,
    maxWidth: 120,
  },
});
