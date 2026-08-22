import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { AppText } from '../common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/currency';

interface OffersForYouModalProps {
  visible: boolean;
  onClose: () => void;
  cartSubtotal: number;
}

interface MilestoneOffer {
  id: string;
  title: string;
  targetAmount: number;
  discountValueText: string;
}

const MILESTONE_OFFERS: MilestoneOffer[] = [
  {
    id: 'm1',
    title: 'Unlock free delivery',
    targetAmount: 199,
    discountValueText: 'Free Delivery',
  },
  {
    id: 'm2',
    title: 'Unlock extra ₹50 OFF',
    targetAmount: 1200,
    discountValueText: '₹50 OFF',
  },
  {
    id: 'm3',
    title: 'Unlock extra ₹100 OFF',
    targetAmount: 1800,
    discountValueText: '₹100 OFF',
  },
  {
    id: 'm4',
    title: 'Unlock extra ₹150 OFF',
    targetAmount: 2400,
    discountValueText: '₹150 OFF',
  },
  {
    id: 'm5',
    title: 'Unlock extra ₹200 OFF',
    targetAmount: 3000,
    discountValueText: '₹200 OFF',
  },
];

export const OffersForYouModal: React.FC<OffersForYouModalProps> = ({
  visible,
  onClose,
  cartSubtotal,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetContainer}>
              {/* Close Button Header */}
              <View style={styles.topHandleBar}>
                <View style={styles.dragPill} />
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                style={styles.closeBtnCircle}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Title */}
              <AppText style={styles.modalTitle}>
                Offers for you
              </AppText>

              {/* Milestones Vertical List */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
              >
                <View style={styles.timelineWrapper}>
                  {MILESTONE_OFFERS.map((item, index) => {
                    const isUnlocked = cartSubtotal >= item.targetAmount;
                    const remaining = item.targetAmount - cartSubtotal;
                    const prevTarget = index === 0 ? 0 : MILESTONE_OFFERS[index - 1].targetAmount;
                    
                    // Progress calculation percentage
                    let progressPercent = 0;
                    if (cartSubtotal >= item.targetAmount) {
                      progressPercent = 100;
                    } else if (cartSubtotal > prevTarget) {
                      progressPercent = Math.min(
                        100,
                        Math.max(0, ((cartSubtotal - prevTarget) / (item.targetAmount - prevTarget)) * 100)
                      );
                    }

                    const isFirst = index === 0;

                    return (
                      <View key={item.id} style={styles.timelineItemRow}>
                        {/* Left Vertical Line & Lock Icon */}
                        <View style={styles.timelineLeftCol}>
                          <View
                            style={[
                              styles.lockCircle,
                              isUnlocked && styles.unlockedCircle,
                              isFirst && isUnlocked && styles.activeActiveCircle,
                            ]}
                          >
                            <Ionicons
                              name={isUnlocked ? 'checkmark' : 'lock-closed'}
                              size={14}
                              color={isUnlocked ? '#FFFFFF' : '#94A3B8'}
                            />
                          </View>

                          {index < MILESTONE_OFFERS.length - 1 && (
                            <View
                              style={[
                                styles.timelineLine,
                                isUnlocked && styles.unlockedTimelineLine,
                              ]}
                            />
                          )}
                        </View>

                        {/* Right Content Card */}
                        <View
                          style={[
                            styles.offerCard,
                            isFirst && isUnlocked && styles.activeOfferCardBorder,
                            isUnlocked && styles.unlockedOfferCardBg,
                          ]}
                        >
                          <View style={styles.offerCardHeader}>
                            <View style={styles.offerTextCol}>
                              <AppText style={styles.offerTitle}>
                                {item.title}
                              </AppText>
                              <AppText style={styles.offerSubtitle}>
                                {isUnlocked
                                  ? `🎉 Unlocked (${item.discountValueText})`
                                  : `Shop for ₹${Math.ceil(remaining)} more`}
                              </AppText>
                            </View>

                            <View
                              style={[
                                styles.statusBadge,
                                isUnlocked ? styles.unlockedStatusBadge : styles.lockedStatusBadge,
                              ]}
                            >
                              <AppText
                                style={[
                                  styles.statusBadgeText,
                                  isUnlocked ? styles.unlockedStatusBadgeText : styles.lockedStatusBadgeText,
                                ]}
                              >
                                {isUnlocked ? 'Unlocked' : 'Locked'}
                              </AppText>
                            </View>
                          </View>

                          {/* Progress bar inside active item */}
                          {!isUnlocked && (
                            <View style={styles.progressTrack}>
                              <View
                                style={[
                                  styles.progressFill,
                                  { width: `${progressPercent}%` },
                                ]}
                              />
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#141122',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: Dimensions.get('window').height * 0.82,
    position: 'relative',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  topHandleBar: {
    alignItems: 'center',
    marginBottom: 12,
  },
  dragPill: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#352E54',
  },
  closeBtnCircle: {
    position: 'absolute',
    top: -46,
    alignSelf: 'center',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#231D36',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#352E54',
    zIndex: 10,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'LexendDeca_700Bold',
    marginBottom: 20,
    marginTop: 6,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  timelineWrapper: {
    paddingLeft: 4,
  },
  timelineItemRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeftCol: {
    alignItems: 'center',
    width: 32,
    marginRight: 12,
  },
  lockCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#231D36',
    borderWidth: 1,
    borderColor: '#352E54',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  unlockedCircle: {
    backgroundColor: '#10B981',
    borderColor: '#34D399',
  },
  activeActiveCircle: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  timelineLine: {
    position: 'absolute',
    top: 28,
    bottom: -16,
    width: 2,
    backgroundColor: '#2E2744',
  },
  unlockedTimelineLine: {
    backgroundColor: '#10B981',
  },
  offerCard: {
    flex: 1,
    backgroundColor: '#1E1932',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#352E54',
  },
  unlockedOfferCardBg: {
    backgroundColor: '#18142A',
    borderColor: '#2E2744',
  },
  activeOfferCardBorder: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  offerCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  offerTextCol: {
    flex: 1,
    paddingRight: 8,
  },
  offerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'LexendDeca_700Bold',
  },
  offerSubtitle: {
    color: '#A78BFA',
    fontSize: 12.5,
    fontFamily: 'LexendDeca_500Medium',
    marginTop: 4,
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedStatusBadge: {
    backgroundColor: '#2E2744',
  },
  unlockedStatusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: 'LexendDeca_600SemiBold',
  },
  lockedStatusBadgeText: {
    color: '#9CA3AF',
  },
  unlockedStatusBadgeText: {
    color: '#10B981',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#2E2744',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
});
