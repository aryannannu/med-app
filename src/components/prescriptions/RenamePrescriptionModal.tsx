import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AppText } from '../common/AppText';
import { AppButton } from '../common/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../store/ThemeContext';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { haptics } from '../../services/hapticService';

interface RenamePrescriptionModalProps {
  visible: boolean;
  currentName: string;
  onSave: (newName: string) => void;
  onClose: () => void;
}

export const RenamePrescriptionModal: React.FC<RenamePrescriptionModalProps> = ({
  visible,
  currentName,
  onSave,
  onClose,
}) => {
  const { colors, isDark } = useAppTheme();
  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName, visible]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    haptics.selection();
    onSave(trimmed);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.backdrop}
      >
        <View style={[styles.modalCard, { backgroundColor: colors.surface }, SHADOWS.modal]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDFC' }]}>
              <Ionicons name="pencil" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                Edit Prescription Name
              </AppText>
              <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                Give this prescription a recognizable title
              </AppText>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Input Box */}
          <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.surfaceElevated : '#F9FAFB', borderColor: colors.border }]}>
            <Ionicons name="document-text-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Viral Fever Meds, Monthly BP"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.textPrimary }]}
              autoFocus
              selectTextOnFocus
              maxLength={40}
            />
            {name.length > 0 && (
              <TouchableOpacity onPress={() => setName('')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Character counter */}
          <View style={styles.counterRow}>
            <AppText variant="caption" color={colors.textMuted} style={{ fontSize: 10 }}>
              {name.length}/40 characters
            </AppText>
          </View>

          {/* Actions */}
          <View style={styles.btnRow}>
            <View style={{ flex: 1 }}>
              <AppButton
                title="Cancel"
                variant="secondary"
                size="md"
                onPress={onClose}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppButton
                title="Save Name"
                variant="primary"
                size="md"
                disabled={!name.trim()}
                onPress={handleSave}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  counterRow: {
    alignItems: 'flex-end',
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
