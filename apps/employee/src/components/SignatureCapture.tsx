import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRef, useState } from 'react';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';

interface SignatureCaptureProps {
  label: string;
  signature: string | null;
  onSignatureChange: (signature: string | null) => void;
  required?: boolean;
  isDark?: boolean;
}

export function SignatureCapture({
  label,
  signature,
  onSignatureChange,
  required = false,
  isDark = false,
}: SignatureCaptureProps) {
  const [showModal, setShowModal] = useState(false);
  const signatureRef = useRef<SignatureViewRef>(null);

  const dynamicStyles = {
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    card: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
  };

  const handleOK = (sig: string) => {
    onSignatureChange(sig);
    setShowModal(false);
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
  };

  const handleEmpty = () => {
    // Signature is empty
  };

  const handleRemove = () => {
    onSignatureChange(null);
  };

  const style = `.m-signature-pad { box-shadow: none; border: none; }
    .m-signature-pad--body { border: none; }
    .m-signature-pad--footer { display: none; margin: 0px; }
    body,html { width: 100%; height: 100%; }`;

  return (
    <View style={[styles.container, dynamicStyles.card]}>
      <View style={styles.header}>
        <Text style={[styles.label, dynamicStyles.text]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        {signature && (
          <TouchableOpacity onPress={handleRemove}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {signature ? (
        <View style={styles.signaturePreview}>
          <View style={styles.signatureImageContainer}>
            {/* Display the base64 signature */}
            <View style={styles.signaturePlaceholder}>
              <Ionicons name="checkmark-circle" size={32} color={colors.success} />
              <Text style={[styles.signedText, dynamicStyles.text]}>Signed</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.resignButton}
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="create" size={18} color={colors.primary} />
            <Text style={styles.resignButtonText}>Re-sign</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.signatureBox, { borderColor: required ? colors.warning : dynamicStyles.card.borderColor }]}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="create-outline" size={32} color={isDark ? colors.textMutedDark : colors.textMuted} />
          <Text style={[styles.tapToSign, dynamicStyles.textMuted]}>Tap to sign</Text>
        </TouchableOpacity>
      )}

      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{label}</Text>
            <TouchableOpacity onPress={handleClear}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.signatureContainer}>
            <SignatureScreen
              ref={signatureRef}
              onOK={handleOK}
              onEmpty={handleEmpty}
              webStyle={style}
              backgroundColor={colors.white}
              penColor={colors.text}
            />
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.footerButton, styles.cancelButton]}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, styles.confirmButton]}
              onPress={() => signatureRef.current?.readSignature()}
            >
              <Text style={styles.confirmButtonText}>Confirm Signature</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  required: {
    color: colors.error,
  },
  clearText: {
    color: colors.error,
    fontSize: fontSize.sm,
  },
  signatureBox: {
    height: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapToSign: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
  },
  signaturePreview: {
    alignItems: 'center',
  },
  signatureImageContainer: {
    width: '100%',
    height: 100,
    borderRadius: borderRadius.md,
    backgroundColor: colors.success + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  signaturePlaceholder: {
    alignItems: 'center',
  },
  signedText: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  resignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  resignButtonText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  clearButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  signatureContainer: {
    flex: 1,
    margin: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButton: {
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
  confirmButton: {
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});
