import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '../../store/ThemeContext';
import { AppText } from '../common/AppText';
import { Ionicons } from '@expo/vector-icons';

export interface StoreCartConflictModalProps {
  visible: boolean;
  currentStoreName: string;
  newStoreName: string;
  onReplaceCart: () => void;
  onKeepCurrentCart: () => void;
}

export const StoreCartConflictModal: React.FC<StoreCartConflictModalProps> = ({
  visible,
  currentStoreName,
  newStoreName,
  onReplaceCart,
  onKeepCurrentCart,
}) => {
  const { colors } = useAppTheme();
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onKeepCurrentCart}
    >
      <TouchableWithoutFeedback onPress={onKeepCurrentCart}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="storefront-outline" size={28} color="#D97706" />
              </View>

              <AppText style={styles.title}>Items from Another Pharmacy</AppText>

              <AppText style={styles.bodyText}>
                Your cart currently contains items from{' '}
                <AppText style={{ fontWeight: '700', color: '#111827' }}>
                  {currentStoreName || 'another pharmacy'}
                </AppText>
                . Adding items from{' '}
                <AppText style={{ fontWeight: '700', color: '#111827' }}>
                  {newStoreName || 'this pharmacy'}
                </AppText>{' '}
                will clear your current cart.
              </AppText>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onKeepCurrentCart}
                  style={styles.cancelBtn}
                >
                  <AppText style={styles.cancelBtnText}>Keep Current Cart</AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onReplaceCart}
                  style={styles.replaceBtn}
                >
                  <AppText style={styles.replaceBtnText}>Replace Cart</AppText>
                </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 13.5,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '700',
  },
  replaceBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  replaceBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});



