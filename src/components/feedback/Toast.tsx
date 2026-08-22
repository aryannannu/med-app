import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../common/AppText';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  style?: ViewStyle;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'success',
  duration = 3000,
  actionLabel,
  onAction,
  onDismiss,
  style,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hide();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hide();
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />;
      case 'error':
        return <Ionicons name="alert-circle" size={20} color={COLORS.danger} />;
      case 'warning':
        return <Ionicons name="warning" size={20} color={COLORS.warning} />;
      case 'info':
      default:
        return <Ionicons name="information-circle" size={20} color={COLORS.info} />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return '#F0FDF4';
      case 'error':
        return '#FEF2F2';
      case 'warning':
        return '#FFFBEB';
      case 'info':
      default:
        return '#EEF0FD';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBgColor(),
          borderColor: COLORS.border,
          transform: [{ translateY }],
          opacity,
        },
        SHADOWS.elevated,
        style,
      ]}
    >
      {getIcon()}
      <AppText variant="bodySmall" color={COLORS.textPrimary} weight="600" style={styles.message}>
        {message}
      </AppText>
      {actionLabel && onAction && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            hide();
            onAction();
          }}
          style={styles.actionBtn}
        >
          <AppText style={styles.actionBtnText}>{actionLabel}</AppText>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  message: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  actionBtn: {
    backgroundColor: '#3A2986',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
