import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '../../theme';
import { AppText } from './AppText';
import { useAppTheme } from '../../store/ThemeContext';

import { haptics } from '../../services/hapticService';

export interface SearchBarProps {
  value: string;
  onChangeText?: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  onPress?: () => void;
  isClickableOnly?: boolean;
  containerStyle?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search medicines, salts, or brand...',
  autoFocus = false,
  onPress,
  isClickableOnly = false,
  containerStyle,
}) => {
  const { colors } = useAppTheme();

  if (isClickableOnly) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          haptics.light();
          if (onPress) onPress();
        }}
        style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle, containerStyle]}
      >
        <Ionicons name="search" size={20} color={colors.primary} style={styles.searchIcon} />
        <AppText variant="bodyMedium" color={colors.textMuted} style={styles.placeholderText}>
          {placeholder}
        </AppText>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle, containerStyle]}>
      <Ionicons name="search" size={20} color={colors.primary} style={styles.searchIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoFocus={autoFocus}
        style={[styles.input, { color: colors.textPrimary }]}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            haptics.light();
            onChangeText?.('');
            onClear?.();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.clearBtn}
        >
          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 50,
    paddingHorizontal: SPACING.md,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
  },
  placeholderText: {
    flex: 1,
  },
  clearBtn: {
    padding: SPACING.xxs,
  },
});

