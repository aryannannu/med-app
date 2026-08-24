import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { useAppTheme } from '../../store/ThemeContext';
import { AppText } from '../common/AppText';
import { AppButton } from '../common/AppButton';
import { Ionicons } from '@expo/vector-icons';

export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  icon = 'help-circle-outline',
  onConfirm,
  onCancel,
}) => {
  const { colors } = useAppTheme();
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.dialog, SHADOWS.modal]}>
              <View
                style={[
                  styles.iconWrapper,
                  { backgroundColor: isDestructive ? COLORS.dangerLight : COLORS.primarySubtle },
                ]}
              >
                <Ionicons
                  name={icon}
                  size={32}
                  color={isDestructive ? COLORS.danger : COLORS.primary}
                />
              </View>

              <AppText variant="titleLarge" color={colors.textPrimary} weight="600" align="center" style={styles.title}>
                {title}
              </AppText>

              <AppText variant="bodyMedium" color={colors.textSecondary} align="center" style={styles.message}>
                {message}
              </AppText>

              <View style={styles.buttonRow}>
                <AppButton
                  title={cancelText}
                  variant="outline"
                  size="md"
                  onPress={onCancel}
                  style={styles.cancelBtn}
                />
                <AppButton
                  title={confirmText}
                  variant={isDestructive ? 'danger' : 'primary'}
                  size="md"
                  onPress={onConfirm}
                  style={styles.confirmBtn}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  message: {
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.md,
  },
  cancelBtn: {
    flex: 1,
  },
  confirmBtn: {
    flex: 1,
  },
});



