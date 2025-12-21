import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  useColorScheme,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';
import { getMyProperties } from '../../src/services/propertyService';
import { createServiceRequest, classifyServiceType } from '../../src/services/requestService';
import { getServiceTypes, ServiceType } from '../../src/services/serviceTypesService';
import type { Property, ServiceRequest } from '../../src/types';

// Fallback service categories when API is not available
const FALLBACK_SERVICE_CATEGORIES = [
  { id: 'plumbing', name: 'Plumbing', nameAr: 'السباكة', icon: 'water', color: '#3b82f6' },
  { id: 'electrical', name: 'Electrical', nameAr: 'الكهرباء', icon: 'flash', color: '#f59e0b' },
  { id: 'hvac', name: 'AC / HVAC', nameAr: 'صيانة المكيفات', icon: 'snow', color: '#06b6d4' },
  { id: 'cleaning', name: 'Cleaning', nameAr: 'التنظيف', icon: 'sparkles', color: '#10b981' },
  { id: 'general', name: 'General', nameAr: 'الصيانة العامة', icon: 'construct', color: '#64748b' },
];

const PRIORITY_OPTIONS = [
  { id: 'low', label: 'Low', description: 'Non-urgent, within a week', color: '#22c55e' },
  { id: 'medium', label: 'Medium', description: 'Within 2-3 days', color: '#f59e0b' },
  { id: 'high', label: 'High', description: 'Within 24 hours', color: '#ef4444' },
  { id: 'urgent', label: 'Urgent', description: 'Emergency, ASAP', color: '#dc2626' },
];

export default function NewRequestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [category, setCategory] = useState<string>(params.category as string || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Service types state
  const [serviceCategories, setServiceCategories] = useState<ServiceType[]>([]);
  const [isLoadingServiceTypes, setIsLoadingServiceTypes] = useState(true);

  // Properties state
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);
  const [showNoPropertyAlert, setShowNoPropertyAlert] = useState(false);

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<ServiceRequest | null>(null);
  const [requestNumberCopied, setRequestNumberCopied] = useState(false);

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

  useEffect(() => {
    fetchServiceTypes();
    fetchProperties();
  }, []);

  const fetchServiceTypes = async () => {
    try {
      setIsLoadingServiceTypes(true);
      const types = await getServiceTypes();
      setServiceCategories(types);
    } catch (err) {
      console.error('[NewRequest] Error fetching service types:', err);
      // Fall back to hardcoded values
      setServiceCategories(FALLBACK_SERVICE_CATEGORIES as unknown as ServiceType[]);
    } finally {
      setIsLoadingServiceTypes(false);
    }
  };

  const fetchProperties = async () => {
    try {
      setIsLoadingProperties(true);
      console.log('[NewRequest] Fetching properties...');
      const props = await getMyProperties();
      console.log('[NewRequest] Properties fetched:', props.length, 'properties');

      // Update properties state
      setProperties(props);

      // Auto-select primary property or first one
      if (props.length > 0) {
        const primary = props.find(p => p.isPrimary) || props[0];
        setSelectedProperty(primary);
        console.log('[NewRequest] Selected property:', primary.id);
      } else {
        // No properties - show alert
        console.log('[NewRequest] No properties found, showing modal');
        setShowNoPropertyAlert(true);
      }
    } catch (error) {
      console.error('[NewRequest] Error fetching properties:', error);
      // On error, assume no properties and show the modal to add one
      console.log('[NewRequest] Error occurred, showing modal');
      setProperties([]);
      setShowNoPropertyAlert(true);
    } finally {
      setIsLoadingProperties(false);
    }
  };

  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
      if (onOk) onOk();
    } else {
      Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
    }
  };

  const submitRequest = async (categoryToUse: string) => {
    try {
      const result = await createServiceRequest({
        title,
        description,
        category: categoryToUse,
        priority,
        propertyId: selectedProperty?.id,
      });

      // Store the created request and show success modal
      setCreatedRequest(result);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error creating request:', error);
      let errorMessage = 'Failed to submit request. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = error.message || error.error || JSON.stringify(error);
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      showAlert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!category || !title || !description) {
      showAlert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    // Validate property is selected
    if (!selectedProperty) {
      setShowNoPropertyAlert(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Call AI classification to validate service type
      const classification = await classifyServiceType(title, description, category);

      if (!classification.matches && classification.confidence !== 'low') {
        // Show confirmation dialog for type mismatch
        const suggestedName = classification.suggestedTypeName;
        const currentCategory = serviceCategories.find((c: ServiceType) => c.id === category);
        const currentName = currentCategory?.name || category;

        if (Platform.OS === 'web') {
          const useAISuggestion = window.confirm(
            `Service Type Suggestion\n\n` +
            `Based on your issue description, "${suggestedName}" might be more appropriate than "${currentName}".\n\n` +
            `${classification.explanation}\n\n` +
            `Click OK to use "${suggestedName}" or Cancel to keep "${currentName}".`
          );
          if (useAISuggestion) {
            setCategory(classification.suggestedTypeId);
            await submitRequest(classification.suggestedTypeId);
          } else {
            await submitRequest(category);
          }
        } else {
          Alert.alert(
            'Service Type Suggestion',
            `Based on your issue description, "${suggestedName}" might be more appropriate than "${currentName}".\n\n${classification.explanation}`,
            [
              {
                text: `Use ${suggestedName}`,
                onPress: async () => {
                  setCategory(classification.suggestedTypeId);
                  await submitRequest(classification.suggestedTypeId);
                },
              },
              {
                text: `Keep ${currentName}`,
                style: 'cancel',
                onPress: async () => {
                  await submitRequest(category);
                },
              },
            ]
          );
        }
      } else {
        // Type matches or low confidence, proceed with selected category
        await submitRequest(category);
      }
    } catch (error: any) {
      console.error('Error in classification or submission:', error);
      // If classification fails, still allow submission with selected category
      await submitRequest(category);
    }
  };

  const copyRequestNumber = async () => {
    if (createdRequest?.requestNo) {
      await Clipboard.setStringAsync(createdRequest.requestNo);
      setRequestNumberCopied(true);
      setTimeout(() => setRequestNumberCopied(false), 2000);
    }
  };

  const handleSuccessOk = () => {
    setShowSuccessModal(false);
    // Navigate to requests tab
    router.replace('/(tabs)/requests');
  };

  const handleNoPropertyDismiss = () => {
    // Navigate back since property is required for service request
    setShowNoPropertyAlert(false);
    router.back();
  };

  if (isLoadingProperties || isLoadingServiceTypes) {
    return (
      <View style={[styles.loadingContainer, dynamicStyles.container]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, dynamicStyles.textMuted]}>
          {isLoadingServiceTypes ? 'Loading services...' : 'Loading your properties...'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.textDark : colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.text]}>New Service Request</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContentContainer}
      >
      {/* No Property Alert Modal */}
      <Modal
        visible={showNoPropertyAlert}
        transparent
        animationType="fade"
        onRequestClose={handleNoPropertyDismiss}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, dynamicStyles.card]}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="home-outline" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.modalTitle, dynamicStyles.text]}>No Property Found</Text>
            <Text style={[styles.modalMessage, dynamicStyles.textMuted]}>
              You need to register a property before creating a service request. It only takes a minute!
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setShowNoPropertyAlert(false);
                  router.back();
                }}
              >
                <Text style={styles.modalButtonSecondaryText}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => {
                  setShowNoPropertyAlert(false);
                  // Pass category so it's retained when returning
                  router.push(`/property/add?returnTo=newRequest&category=${category}`);
                }}
              >
                <Text style={styles.modalButtonPrimaryText}>Add Property</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessOk}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, dynamicStyles.card]}>
            <View style={[styles.modalIconContainer, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            </View>
            <Text style={[styles.modalTitle, dynamicStyles.text]}>Request Submitted!</Text>
            <Text style={[styles.modalMessage, dynamicStyles.textMuted]}>
              Your service request has been submitted successfully. We will assign a technician shortly.
            </Text>

            {/* Request Number Card */}
            <View style={[styles.requestNumberCard, dynamicStyles.card]}>
              <Text style={[styles.requestNumberLabel, dynamicStyles.textMuted]}>Request Number</Text>
              <View style={styles.requestNumberRow}>
                <Text style={[styles.requestNumber, dynamicStyles.text]}>
                  {createdRequest?.requestNo || 'N/A'}
                </Text>
                <TouchableOpacity
                  style={[styles.copyButton, requestNumberCopied && styles.copyButtonSuccess]}
                  onPress={copyRequestNumber}
                >
                  <Ionicons
                    name={requestNumberCopied ? 'checkmark' : 'copy-outline'}
                    size={18}
                    color={requestNumberCopied ? colors.success : colors.primary}
                  />
                  <Text style={[styles.copyButtonText, requestNumberCopied && { color: colors.success }]}>
                    {requestNumberCopied ? 'Copied!' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.successButton]}
              onPress={handleSuccessOk}
            >
              <Text style={styles.successButtonText}>View My Requests</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Property Selection Modal */}
      <Modal
        visible={showPropertyPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPropertyPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.pickerContent, dynamicStyles.card]}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, dynamicStyles.text]}>Select Property</Text>
              <TouchableOpacity onPress={() => setShowPropertyPicker(false)}>
                <Ionicons name="close" size={24} color={isDark ? colors.textDark : colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList}>
              {properties.map((prop) => (
                <TouchableOpacity
                  key={prop.id}
                  style={[
                    styles.pickerItem,
                    dynamicStyles.card,
                    selectedProperty?.id === prop.id && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedProperty(prop);
                    setShowPropertyPicker(false);
                  }}
                >
                  <View style={styles.pickerItemContent}>
                    <Ionicons name="location" size={20} color={colors.primary} />
                    <View style={styles.pickerItemText}>
                      <Text style={[styles.pickerItemTitle, dynamicStyles.text]}>
                        {prop.address || `Unit ${prop.unitNo}`}
                      </Text>
                      {prop.isPrimary && (
                        <Text style={styles.primaryBadge}>Primary</Text>
                      )}
                    </View>
                  </View>
                  {selectedProperty?.id === prop.id && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}

              {/* Add New Property Button */}
              <TouchableOpacity
                style={[styles.addPropertyButton, dynamicStyles.card]}
                onPress={() => {
                  setShowPropertyPicker(false);
                  router.push(`/property/add?returnTo=newRequest&category=${category}`);
                }}
              >
                <View style={styles.pickerItemContent}>
                  <View style={styles.addPropertyIcon}>
                    <Ionicons name="add" size={20} color={colors.white} />
                  </View>
                  <Text style={[styles.addPropertyText, { color: colors.primary }]}>
                    Add New Property
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Category Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>Service Type *</Text>
        <View style={styles.categoryGrid}>
          {serviceCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryCard,
                dynamicStyles.card,
                category === cat.id && { borderColor: cat.color, borderWidth: 2 },
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                <Ionicons name={cat.icon as any} size={24} color={cat.color} />
              </View>
              <Text style={[styles.categoryLabel, dynamicStyles.text]}>{cat.name}</Text>
              {category === cat.id && (
                <View style={[styles.checkIcon, { backgroundColor: cat.color }]}>
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Title */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>Issue Title *</Text>
        <TextInput
          style={[styles.input, dynamicStyles.input]}
          placeholder="Brief description of the issue"
          placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />
      </View>

      {/* Description */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }, dynamicStyles.text]}>Description *</Text>
          {title.trim() && description !== title && (
            <TouchableOpacity
              style={styles.copyFromTitleButton}
              onPress={() => setDescription(title)}
            >
              <Ionicons name="copy-outline" size={14} color={colors.primary} />
              <Text style={styles.copyFromTitleText}>Use title</Text>
            </TouchableOpacity>
          )}
        </View>
        <TextInput
          style={[styles.input, styles.textArea, dynamicStyles.input]}
          placeholder="Provide more details about the issue..."
          placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={[styles.charCount, dynamicStyles.textMuted]}>{description.length}/500</Text>
      </View>

      {/* Priority */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>Priority</Text>
        <View style={styles.priorityContainer}>
          {PRIORITY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.priorityOption,
                dynamicStyles.card,
                priority === opt.id && { borderColor: opt.color, borderWidth: 2 },
              ]}
              onPress={() => setPriority(opt.id)}
            >
              <View style={styles.priorityHeader}>
                <View style={[styles.priorityDot, { backgroundColor: opt.color }]} />
                <Text style={[styles.priorityLabel, dynamicStyles.text]}>{opt.label}</Text>
                {priority === opt.id && <Ionicons name="checkmark-circle" size={20} color={opt.color} />}
              </View>
              <Text style={[styles.priorityDescription, dynamicStyles.textMuted]}>{opt.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Property */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>Property Address</Text>
        <TouchableOpacity
          style={[styles.input, styles.selectButton, dynamicStyles.input]}
          onPress={() => properties.length > 0 && setShowPropertyPicker(true)}
          disabled={properties.length === 0}
        >
          <Ionicons name="location-outline" size={20} color={isDark ? colors.textMutedDark : colors.textMuted} />
          <Text
            style={[
              styles.selectText,
              selectedProperty ? dynamicStyles.text : dynamicStyles.textMuted,
            ]}
            numberOfLines={1}
          >
            {selectedProperty?.address || selectedProperty?.unitNo || 'No property selected'}
          </Text>
          {properties.length >= 1 && (
            <Ionicons name="chevron-down" size={20} color={isDark ? colors.textMutedDark : colors.textMuted} />
          )}
        </TouchableOpacity>
        {properties.length === 0 && (
          <TouchableOpacity onPress={() => router.push('/property/add?returnTo=newRequest')}>
            <Text style={[styles.helperText, { color: colors.primary }]}>
              No properties registered. Tap here to add one.
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Photos */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>Photos (Optional)</Text>
        <TouchableOpacity style={[styles.photoButton, dynamicStyles.card]}>
          <Ionicons name="camera-outline" size={32} color={colors.primary} />
          <Text style={[styles.photoText, { color: colors.primary }]}>Add Photos</Text>
          <Text style={[styles.photoSubtext, dynamicStyles.textMuted]}>
            Helps technicians understand the issue better
          </Text>
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
            pressed && styles.submitButtonPressed,
            { cursor: 'pointer' } as any,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Request</Text>
          )}
        </Pressable>
      </View>

      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: spacing.xxl * 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.md,
  },
  section: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  copyFromTitleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.md,
  },
  copyFromTitleText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  categoryCard: {
    width: '30%',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    position: 'relative',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  checkIcon: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.md,
  },
  charCount: {
    fontSize: fontSize.xs,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  priorityContainer: {
    gap: spacing.sm,
  },
  priorityOption: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  priorityLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    flex: 1,
  },
  priorityDescription: {
    fontSize: fontSize.sm,
    marginLeft: 20,
    marginTop: 4,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectText: {
    flex: 1,
    fontSize: fontSize.md,
  },
  helperText: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  photoButton: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  photoText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.sm,
  },
  photoSubtext: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  submitContainer: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  submitButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonPrimaryText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  successButton: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonSecondary: {
    backgroundColor: colors.primary + '15',
  },
  modalButtonSecondaryText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  // Picker styles
  pickerContent: {
    width: '100%',
    maxHeight: '70%',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    position: 'absolute',
    bottom: 0,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  pickerList: {
    padding: spacing.lg,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  pickerItemSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  pickerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  pickerItemText: {
    flex: 1,
  },
  pickerItemTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  primaryBadge: {
    fontSize: fontSize.xs,
    color: colors.primary,
    marginTop: 2,
  },
  addPropertyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  addPropertyIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPropertyText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.md,
  },
  // Success modal styles
  requestNumberCard: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  requestNumberLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  requestNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestNumber: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '15',
  },
  copyButtonSuccess: {
    backgroundColor: colors.success + '15',
  },
  copyButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
});
