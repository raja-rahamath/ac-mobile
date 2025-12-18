import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';

export type ItemType = 'MATERIAL' | 'PART' | 'CONSUMABLE';

export interface MaterialItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  itemType: ItemType;
}

interface MaterialsListProps {
  items: MaterialItem[];
  onAddItem: (item: Omit<MaterialItem, 'id'>) => void;
  onRemoveItem: (index: number) => void;
  isDark?: boolean;
  isEditable?: boolean;
}

const ITEM_TYPES: { value: ItemType; label: string }[] = [
  { value: 'MATERIAL', label: 'Material' },
  { value: 'PART', label: 'Part' },
  { value: 'CONSUMABLE', label: 'Consumable' },
];

export function MaterialsList({
  items,
  onAddItem,
  onRemoveItem,
  isDark = false,
  isEditable = true,
}: MaterialsListProps) {
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState<Omit<MaterialItem, 'id'>>({
    description: '',
    quantity: 1,
    unitPrice: 0,
    itemType: 'MATERIAL',
  });

  const dynamicStyles = {
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    card: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
    input: {
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
      borderColor: isDark ? colors.borderDark : colors.border,
      color: isDark ? colors.textDark : colors.text,
    },
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const handleAddItem = () => {
    if (!newItem.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    if (newItem.quantity <= 0) {
      Alert.alert('Error', 'Quantity must be greater than 0');
      return;
    }
    if (newItem.unitPrice < 0) {
      Alert.alert('Error', 'Price cannot be negative');
      return;
    }

    onAddItem({
      ...newItem,
      description: newItem.description.trim(),
    });

    // Reset form
    setNewItem({
      description: '',
      quantity: 1,
      unitPrice: 0,
      itemType: 'MATERIAL',
    });
    setShowModal(false);
  };

  const handleRemoveItem = (index: number) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onRemoveItem(index) },
    ]);
  };

  return (
    <View style={[styles.container, dynamicStyles.card]}>
      <View style={styles.header}>
        <Text style={[styles.title, dynamicStyles.text]}>Materials & Parts</Text>
        {isEditable && (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
            <Ionicons name="add" size={20} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={32} color={isDark ? colors.textMutedDark : colors.textMuted} />
          <Text style={[styles.emptyText, dynamicStyles.textMuted]}>No materials added yet</Text>
        </View>
      ) : (
        <>
          {items.map((item, index) => (
            <View key={item.id || index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemDescription, dynamicStyles.text]}>{item.description}</Text>
                <View style={styles.itemMeta}>
                  <View style={styles.itemTypeBadge}>
                    <Text style={styles.itemTypeBadgeText}>{item.itemType}</Text>
                  </View>
                  <Text style={[styles.itemQuantity, dynamicStyles.textMuted]}>
                    Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                  </Text>
                </View>
              </View>
              <View style={styles.itemActions}>
                <Text style={[styles.itemTotal, dynamicStyles.text]}>
                  ${(item.quantity * item.unitPrice).toFixed(2)}
                </Text>
                {isEditable && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveItem(index)}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, dynamicStyles.text]}>Total Materials:</Text>
            <Text style={[styles.totalValue, dynamicStyles.text]}>${calculateTotal().toFixed(2)}</Text>
          </View>
        </>
      )}

      {/* Add Item Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, dynamicStyles.card]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, dynamicStyles.text]}>Add Material/Part</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? colors.textDark : colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Item Type */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, dynamicStyles.text]}>Type</Text>
                <View style={styles.typeSelector}>
                  {ITEM_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeButton,
                        newItem.itemType === type.value && styles.typeButtonActive,
                      ]}
                      onPress={() => setNewItem({ ...newItem, itemType: type.value })}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          newItem.itemType === type.value && styles.typeButtonTextActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, dynamicStyles.text]}>Description</Text>
                <TextInput
                  style={[styles.input, dynamicStyles.input]}
                  value={newItem.description}
                  onChangeText={(text) => setNewItem({ ...newItem, description: text })}
                  placeholder="e.g., AC Filter, Pipe Joint"
                  placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
                />
              </View>

              {/* Quantity and Price */}
              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.label, dynamicStyles.text]}>Quantity</Text>
                  <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    value={newItem.quantity.toString()}
                    onChangeText={(text) =>
                      setNewItem({ ...newItem, quantity: parseInt(text) || 0 })
                    }
                    keyboardType="number-pad"
                    placeholder="1"
                    placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.label, dynamicStyles.text]}>Unit Price ($)</Text>
                  <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    value={newItem.unitPrice.toString()}
                    onChangeText={(text) =>
                      setNewItem({ ...newItem, unitPrice: parseFloat(text) || 0 })
                    }
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
                  />
                </View>
              </View>

              {/* Preview */}
              <View style={[styles.preview, { backgroundColor: colors.primary + '10' }]}>
                <Text style={[styles.previewLabel, dynamicStyles.textMuted]}>Subtotal:</Text>
                <Text style={[styles.previewValue, dynamicStyles.text]}>
                  ${(newItem.quantity * newItem.unitPrice).toFixed(2)}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleAddItem}
                >
                  <Text style={styles.saveButtonText}>Add Item</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
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
  itemDescription: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  itemTypeBadge: {
    backgroundColor: colors.secondary + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  itemTypeBadgeText: {
    fontSize: 10,
    color: colors.secondary,
    fontWeight: fontWeight.medium,
  },
  itemQuantity: {
    fontSize: fontSize.xs,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  itemTotal: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  removeButton: {
    padding: spacing.xs,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  totalValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '15',
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  preview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  previewLabel: {
    fontSize: fontSize.sm,
  },
  previewValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});
