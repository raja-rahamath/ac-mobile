import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { registerProperty, getAreas, type OwnershipType, type Area } from '../../src/services/propertyService';

type OwnershipOption = {
  value: OwnershipType;
  label: string;
  description: string;
};

const OWNERSHIP_OPTIONS: OwnershipOption[] = [
  { value: 'TENANT', label: 'Tenant', description: 'I rent this property' },
  { value: 'OWNER', label: 'Owner', description: 'I own this property' },
];

export default function AddPropertyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ returnTo?: string; category?: string }>();

  const [flat, setFlat] = useState('');
  const [building, setBuilding] = useState('');
  const [road, setRoad] = useState('');
  const [block, setBlock] = useState('');
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [ownershipType, setOwnershipType] = useState<OwnershipType>('TENANT');

  const [areas, setAreas] = useState<Area[]>([]);
  const [showAreaPicker, setShowAreaPicker] = useState(false);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [areaSearchQuery, setAreaSearchQuery] = useState('');

  // Filter areas based on search query
  const filteredAreas = useMemo(() => {
    if (!areaSearchQuery.trim()) return areas;
    const query = areaSearchQuery.toLowerCase();
    return areas.filter(area =>
      area.name.toLowerCase().includes(query) ||
      (area.nameAr && area.nameAr.includes(areaSearchQuery))
    );
  }, [areas, areaSearchQuery]);

  // Load all areas on mount
  useEffect(() => {
    const loadAreas = async () => {
      setIsLoadingAreas(true);
      try {
        const results = await getAreas();
        setAreas(results);
      } catch (error) {
        console.error('Failed to fetch areas:', error);
        Alert.alert('Error', 'Failed to load areas. Please try again.');
      } finally {
        setIsLoadingAreas(false);
      }
    };
    loadAreas();
  }, []);

  const selectArea = useCallback((area: Area) => {
    setSelectedArea(area);
    setShowAreaPicker(false);
    setAreaSearchQuery('');
    if (errors.areaName) setErrors(prev => ({ ...prev, areaName: '' }));
  }, [errors.areaName]);

  const closeAreaPicker = useCallback(() => {
    setShowAreaPicker(false);
    setAreaSearchQuery('');
  }, []);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // Flat is now optional
    if (!building.trim()) newErrors.building = 'Building number is required';
    if (!road.trim()) newErrors.road = 'Road number is required';
    if (!block.trim()) newErrors.block = 'Block number is required';
    if (!selectedArea) newErrors.areaName = 'Area is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [building, road, block, selectedArea]);

  const handleSubmit = async () => {
    console.log('[AddProperty] handleSubmit called');
    console.log('[AddProperty] values:', { flat, building, road, block, selectedArea, ownershipType });

    if (!validate()) {
      console.log('[AddProperty] validation failed, errors:', errors);
      return;
    }
    if (!selectedArea) {
      console.log('[AddProperty] no selectedArea');
      return;
    }

    console.log('[AddProperty] submitting...');
    setIsSubmitting(true);
    try {
      await registerProperty({
        flat: flat.trim() || '',
        building: building.trim(),
        road: road.trim(),
        block: block.trim(),
        areaName: selectedArea.name,
        ownershipType,
        isPrimary: true,
      });

      // Show success alert and navigate
      Alert.alert(
        'Success',
        'Property registered successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate based on where user came from
              if (params.returnTo === 'newRequest') {
                // Pass category back to preserve selection
                const categoryParam = params.category ? `?category=${params.category}` : '';
                router.replace(`/request/new${categoryParam}`);
              } else {
                router.back();
              }
            },
          },
        ]
      );

      // For web, Alert.alert callback may not work reliably
      // So also set a timeout to navigate after showing alert
      if (Platform.OS === 'web') {
        setTimeout(() => {
          if (params.returnTo === 'newRequest') {
            // Pass category back to preserve selection
            const categoryParam = params.category ? `?category=${params.category}` : '';
            router.replace(`/request/new${categoryParam}`);
          } else {
            router.back();
          }
        }, 1500);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to register property'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen
        options={{
          headerShown: false,
          title: '',
        }}
      />

      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (Platform.OS === 'web') {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                router.replace('/request/new');
              }
            } else {
              router.back();
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Property</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="home" size={32} color="#8B5CF6" />
            </View>
            <Text style={styles.sectionTitle}>Register Your Property</Text>
            <Text style={styles.headerSubtitle}>
              Enter your property details to create service requests
            </Text>
          </View>

          {/* Flat/Villa Number (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Flat/Villa Number (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 101, 12A"
              placeholderTextColor="#666"
              value={flat}
              onChangeText={setFlat}
            />
          </View>

          {/* Building Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Building Number *</Text>
            <TextInput
              style={[styles.input, errors.building && styles.inputError]}
              placeholder="e.g., 1458"
              placeholderTextColor="#666"
              value={building}
              onChangeText={(text) => {
                setBuilding(text);
                if (errors.building) setErrors(prev => ({ ...prev, building: '' }));
              }}
              keyboardType="number-pad"
            />
            {errors.building && <Text style={styles.errorText}>{errors.building}</Text>}
          </View>

          {/* Road Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Road Number *</Text>
            <TextInput
              style={[styles.input, errors.road && styles.inputError]}
              placeholder="e.g., 3435"
              placeholderTextColor="#666"
              value={road}
              onChangeText={(text) => {
                setRoad(text);
                if (errors.road) setErrors(prev => ({ ...prev, road: '' }));
              }}
              keyboardType="number-pad"
            />
            {errors.road && <Text style={styles.errorText}>{errors.road}</Text>}
          </View>

          {/* Block Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Block Number *</Text>
            <TextInput
              style={[styles.input, errors.block && styles.inputError]}
              placeholder="e.g., 334"
              placeholderTextColor="#666"
              value={block}
              onChangeText={(text) => {
                setBlock(text);
                if (errors.block) setErrors(prev => ({ ...prev, block: '' }));
              }}
              keyboardType="number-pad"
            />
            {errors.block && <Text style={styles.errorText}>{errors.block}</Text>}
          </View>

          {/* Area Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Area *</Text>
            <TouchableOpacity
              style={[styles.input, styles.dropdownButton, errors.areaName && styles.inputError]}
              onPress={() => setShowAreaPicker(true)}
              disabled={isLoadingAreas}
            >
              {isLoadingAreas ? (
                <ActivityIndicator size="small" color="#8B5CF6" />
              ) : (
                <>
                  <Text style={[styles.dropdownText, !selectedArea && styles.placeholderText]}>
                    {selectedArea ? selectedArea.name : 'Select an area'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </>
              )}
            </TouchableOpacity>
            {errors.areaName && <Text style={styles.errorText}>{errors.areaName}</Text>}
          </View>

          {/* Area Picker Modal */}
          <Modal
            visible={showAreaPicker}
            transparent
            animationType="slide"
            onRequestClose={closeAreaPicker}
          >
            <Pressable style={styles.modalOverlay} onPress={closeAreaPicker}>
              <Pressable style={styles.pickerContainer} onPress={(e) => e.stopPropagation()}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Select Area</Text>
                  <TouchableOpacity onPress={closeAreaPicker} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
                {/* Search Input */}
                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={18} color="#666" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search areas..."
                    placeholderTextColor="#666"
                    value={areaSearchQuery}
                    onChangeText={setAreaSearchQuery}
                    autoCorrect={false}
                    autoCapitalize="none"
                    autoFocus={true}
                  />
                  {areaSearchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setAreaSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Ionicons name="close-circle" size={18} color="#666" />
                    </TouchableOpacity>
                  )}
                </View>
                <FlatList
                  data={filteredAreas}
                  keyExtractor={(item) => item.id}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.pickerItem,
                        selectedArea?.id === item.id && styles.pickerItemSelected,
                      ]}
                      onPress={() => selectArea(item)}
                    >
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color={selectedArea?.id === item.id ? '#8B5CF6' : '#999'}
                      />
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedArea?.id === item.id && styles.pickerItemTextSelected,
                        ]}
                      >
                        {item.name}
                      </Text>
                      {selectedArea?.id === item.id && (
                        <Ionicons name="checkmark-circle" size={20} color="#8B5CF6" />
                      )}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Ionicons name="search-outline" size={48} color="#666" />
                      <Text style={styles.emptyText}>
                        {areaSearchQuery ? `No areas found for "${areaSearchQuery}"` : 'No areas available'}
                      </Text>
                      {areaSearchQuery.length > 0 && (
                        <TouchableOpacity
                          style={styles.clearSearchButton}
                          onPress={() => setAreaSearchQuery('')}
                        >
                          <Text style={styles.clearSearchText}>Clear Search</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  }
                />
              </Pressable>
            </Pressable>
          </Modal>

          {/* Ownership Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>I am a *</Text>
            <View style={styles.ownershipContainer}>
              {OWNERSHIP_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.ownershipOption,
                    ownershipType === option.value && styles.ownershipOptionSelected,
                  ]}
                  onPress={() => setOwnershipType(option.value)}
                >
                  <View style={styles.radioOuter}>
                    {ownershipType === option.value && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.ownershipText}>
                    <Text style={[
                      styles.ownershipLabel,
                      ownershipType === option.value && styles.ownershipLabelSelected,
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={styles.ownershipDescription}>{option.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
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
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Register Property</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  areaInputContainer: {
    position: 'relative',
  },
  areaLoader: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  suggestionsContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#2a2a3e',
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
    gap: 10,
  },
  suggestionText: {
    color: '#fff',
    fontSize: 14,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  placeholderText: {
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  pickerItemSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  pickerItemText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  pickerItemTextSelected: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  clearSearchButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  clearSearchText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f1f',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#fff',
    fontSize: 15,
  },
  ownershipContainer: {
    gap: 12,
  },
  ownershipOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
    gap: 12,
  },
  ownershipOptionSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8B5CF6',
  },
  ownershipText: {
    flex: 1,
  },
  ownershipLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  ownershipLabelSelected: {
    color: '#8B5CF6',
  },
  ownershipDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
