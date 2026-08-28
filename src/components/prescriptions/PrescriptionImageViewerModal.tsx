import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { AppText } from '../common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../theme';

interface PrescriptionImageViewerModalProps {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const PrescriptionImageViewerModal: React.FC<PrescriptionImageViewerModalProps> = ({
  visible,
  imageUri,
  onClose,
}) => {
  if (!imageUri) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View>
              <AppText variant="titleMedium" color="#FFFFFF" weight="700">
                Prescription Document
              </AppText>
              <AppText variant="caption" color="rgba(255,255,255,0.7)">
                Pinch or scroll to verify doctor's handwriting
              </AppText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.prescriptionImg}
              resizeMode="contain"
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  prescriptionImg: {
    width: SCREEN_WIDTH - 24,
    height: SCREEN_HEIGHT * 0.75,
    borderRadius: 12,
  },
});
