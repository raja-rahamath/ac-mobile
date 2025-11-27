import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';

const SERVICE_CATEGORIES = [
  { id: 'plumbing', label: 'Plumbing', icon: 'water', color: '#3b82f6' },
  { id: 'electrical', label: 'Electrical', icon: 'flash', color: '#f59e0b' },
  { id: 'hvac', label: 'AC / HVAC', icon: 'snow', color: '#06b6d4' },
  { id: 'appliance', label: 'Appliances', icon: 'tv', color: '#8b5cf6' },
  { id: 'cleaning', label: 'Cleaning', icon: 'sparkles', color: '#10b981' },
  { id: 'general', label: 'General', icon: 'construct', color: '#64748b' },
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
  const [property, setProperty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!category || !title || !description) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Request Submitted',
        'Your service request has been submitted successfully. We will assign a technician shortly.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 1500);
  };

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]}>
      {/* Category Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>Service Type *</Text>
        <View style={styles.categoryGrid}>
          {SERVICE_CATEGORIES.map((cat) => (
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
              <Text style={[styles.categoryLabel, dynamicStyles.text]}>{cat.label}</Text>
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
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>Description *</Text>
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
        <TouchableOpacity style={[styles.input, styles.selectButton, dynamicStyles.input]}>
          <Ionicons name="location-outline" size={20} color={isDark ? colors.textMutedDark : colors.textMuted} />
          <Text style={[styles.selectText, dynamicStyles.textMuted]}>
            {property || 'Select a property'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={isDark ? colors.textMutedDark : colors.textMuted} />
        </TouchableOpacity>
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
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
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
  submitButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
