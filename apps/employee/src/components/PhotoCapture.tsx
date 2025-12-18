import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';

export type PhotoType = 'BEFORE' | 'DURING' | 'AFTER' | 'ISSUE' | 'OTHER';

export interface CapturedPhoto {
  uri: string;
  type: string;
  name: string;
  photoType: PhotoType;
  isVideo?: boolean;
}

interface PhotoCaptureProps {
  photos: CapturedPhoto[];
  onAddPhoto: (photo: CapturedPhoto) => void;
  onRemovePhoto: (index: number) => void;
  isUploading?: boolean;
  isDark?: boolean;
  maxPhotos?: number;
}

const PHOTO_TYPES: { value: PhotoType; label: string; icon: string }[] = [
  { value: 'BEFORE', label: 'Before', icon: 'arrow-back' },
  { value: 'DURING', label: 'During', icon: 'construct' },
  { value: 'AFTER', label: 'After', icon: 'checkmark' },
  { value: 'ISSUE', label: 'Issue', icon: 'warning' },
];

export function PhotoCapture({
  photos,
  onAddPhoto,
  onRemovePhoto,
  isUploading = false,
  isDark = false,
  maxPhotos = 20,
}: PhotoCaptureProps) {
  const [selectedType, setSelectedType] = useState<PhotoType>('DURING');
  const [isCapturing, setIsCapturing] = useState(false);

  const dynamicStyles = {
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    card: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please allow camera and photo library access to capture work photos.'
      );
      return false;
    }
    return true;
  };

  const handleCameraCapture = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Limit Reached', `Maximum ${maxPhotos} photos allowed`);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsCapturing(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const isVideo = asset.type === 'video';
        const photo: CapturedPhoto = {
          uri: asset.uri,
          type: isVideo ? 'video/mp4' : 'image/jpeg',
          name: `${selectedType.toLowerCase()}_${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`,
          photoType: selectedType,
          isVideo,
        };
        onAddPhoto(photo);
      }
    } catch (error) {
      console.error('Camera capture error:', error);
      Alert.alert('Error', 'Failed to capture photo');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleGalleryPick = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Limit Reached', `Maximum ${maxPhotos} photos allowed`);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsCapturing(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        selectionLimit: maxPhotos - photos.length,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        result.assets.forEach((asset) => {
          const isVideo = asset.type === 'video';
          const photo: CapturedPhoto = {
            uri: asset.uri,
            type: isVideo ? 'video/mp4' : 'image/jpeg',
            name: `${selectedType.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${isVideo ? 'mp4' : 'jpg'}`,
            photoType: selectedType,
            isVideo,
          };
          onAddPhoto(photo);
        });
      }
    } catch (error) {
      console.error('Gallery pick error:', error);
      Alert.alert('Error', 'Failed to select photos');
    } finally {
      setIsCapturing(false);
    }
  };

  const showCaptureOptions = () => {
    Alert.alert('Add Photo/Video', 'Choose how to add media', [
      { text: 'Take Photo/Video', onPress: handleCameraCapture },
      { text: 'Choose from Gallery', onPress: handleGalleryPick },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const renderPhotoItem = ({ item, index }: { item: CapturedPhoto; index: number }) => (
    <View style={styles.photoItem}>
      <Image source={{ uri: item.uri }} style={styles.photoThumbnail} />
      {item.isVideo && (
        <View style={styles.videoIndicator}>
          <Ionicons name="videocam" size={16} color={colors.white} />
        </View>
      )}
      <View style={[styles.photoTypeBadge, { backgroundColor: colors.primary }]}>
        <Text style={styles.photoTypeBadgeText}>{item.photoType}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemovePhoto(index)}
        disabled={isUploading}
      >
        <Ionicons name="close-circle" size={24} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, dynamicStyles.card]}>
      <View style={styles.header}>
        <Text style={[styles.title, dynamicStyles.text]}>Photos & Videos</Text>
        <Text style={[styles.photoCount, dynamicStyles.textMuted]}>
          {photos.length}/{maxPhotos}
        </Text>
      </View>

      {/* Photo Type Selector */}
      <View style={styles.typeSelector}>
        <Text style={[styles.typeLabel, dynamicStyles.textMuted]}>Tag as:</Text>
        <View style={styles.typeButtons}>
          {PHOTO_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                selectedType === type.value && styles.typeButtonActive,
              ]}
              onPress={() => setSelectedType(type.value)}
            >
              <Ionicons
                name={type.icon as any}
                size={14}
                color={selectedType === type.value ? colors.white : colors.primary}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  selectedType === type.value && styles.typeButtonTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Photos Grid */}
      {photos.length > 0 && (
        <FlatList
          data={photos}
          renderItem={renderPhotoItem}
          keyExtractor={(item, index) => `${item.uri}-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.photoList}
          contentContainerStyle={styles.photoListContent}
        />
      )}

      {/* Capture Buttons */}
      <View style={styles.captureButtons}>
        <TouchableOpacity
          style={[styles.captureButton, styles.cameraButton]}
          onPress={handleCameraCapture}
          disabled={isCapturing || isUploading || photos.length >= maxPhotos}
        >
          {isCapturing ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="camera" size={24} color={colors.white} />
              <Text style={styles.captureButtonText}>Camera</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, styles.galleryButton]}
          onPress={handleGalleryPick}
          disabled={isCapturing || isUploading || photos.length >= maxPhotos}
        >
          <Ionicons name="images" size={24} color={colors.white} />
          <Text style={styles.captureButtonText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {isUploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.uploadingText, dynamicStyles.textMuted]}>Uploading...</Text>
        </View>
      )}
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
  photoCount: {
    fontSize: fontSize.sm,
  },
  typeSelector: {
    marginBottom: spacing.md,
  },
  typeLabel: {
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
    gap: spacing.xs,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  photoList: {
    marginBottom: spacing.md,
  },
  photoListContent: {
    gap: spacing.sm,
  },
  photoItem: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
  },
  photoTypeBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 2,
    alignItems: 'center',
  },
  photoTypeBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: fontWeight.medium,
  },
  removeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  captureButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  captureButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  cameraButton: {
    backgroundColor: colors.primary,
  },
  galleryButton: {
    backgroundColor: colors.secondary,
  },
  captureButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
  },
});
