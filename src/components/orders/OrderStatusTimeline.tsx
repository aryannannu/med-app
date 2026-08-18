import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { OrderTimelineEvent } from '../../types/order';
import { COLORS, SPACING } from '../../theme';
import { AppText } from '../common/AppText';
import { formatDateTime } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export interface OrderStatusTimelineProps {
  events: OrderTimelineEvent[];
  style?: ViewStyle;
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ events, style }) => {
  return (
    <View style={[styles.container, style]}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;

        return (
          <View key={event.id || `event-${index}`} style={styles.eventRow}>
            {/* Left Indicator & Line */}
            <View style={styles.indicatorContainer}>
              <View
                style={[
                  styles.node,
                  event.isCompleted && styles.nodeCompleted,
                  event.isCurrent && styles.nodeCurrent,
                  !event.isCompleted && !event.isCurrent && styles.nodePending,
                ]}
              >
                {event.isCompleted ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : event.isCurrent ? (
                  <View style={styles.currentInnerDot} />
                ) : (
                  <View style={styles.pendingInnerDot} />
                )}
              </View>

              {!isLast && (
                <View
                  style={[
                    styles.verticalLine,
                    event.isCompleted ? styles.lineCompleted : styles.linePending,
                  ]}
                />
              )}
            </View>

            {/* Right Content */}
            <View style={styles.contentContainer}>
              <View style={styles.titleRow}>
                <AppText
                  variant="titleSmall"
                  color={
                    event.isCurrent
                      ? COLORS.primary
                      : event.isCompleted
                      ? COLORS.textPrimary
                      : COLORS.textMuted
                  }
                  weight={event.isCurrent || event.isCompleted ? '700' : '500'}
                >
                  {event.title}
                </AppText>
                {event.timestamp > 0 && (
                  <AppText variant="caption" color={COLORS.textMuted}>
                    {formatDateTime(event.timestamp)}
                  </AppText>
                )}
              </View>

              <AppText
                variant="bodySmall"
                color={event.isCurrent ? COLORS.textSecondary : COLORS.textMuted}
                style={styles.description}
              >
                {event.description}
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
  eventRow: {
    flexDirection: 'row',
    minHeight: 58,
  },
  indicatorContainer: {
    alignItems: 'center',
    width: 28,
  },
  node: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeCompleted: {
    backgroundColor: COLORS.success,
  },
  nodeCurrent: {
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.primaryMuted,
  },
  nodePending: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  currentInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  pendingInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  lineCompleted: {
    backgroundColor: COLORS.success,
  },
  linePending: {
    backgroundColor: COLORS.border,
  },
  contentContainer: {
    flex: 1,
    marginLeft: SPACING.md,
    paddingBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  description: {
    marginTop: 2,
  },
});
