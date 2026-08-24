/**
 * ThemedScreenWrapper - Universal dark mode wrapper for all screens.
 * Wraps SafeAreaView+root-View with automatic dark/light background.
 */
import React from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  ViewStyle,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppTheme } from '../../store/ThemeContext';

interface ThemedScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  usesKeyboardAvoid?: boolean;
}

export const ThemedScreenWrapper: React.FC<ThemedScreenWrapperProps> = ({
  children,
  scrollable = false,
  style,
  contentStyle,
  usesKeyboardAvoid = false,
}) => {
  const { colors } = useAppTheme();

  const inner = scrollable ? (
    <ScrollView
      style={[{ backgroundColor: colors.background }, style]}
      contentContainerStyle={contentStyle}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      {children}
    </View>
  );

  if (usesKeyboardAvoid) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, backgroundColor: colors.background }}
        >
          {inner}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {inner}
    </SafeAreaView>
  );
};

/**
 * ThemedCard - Auto dark mode surface card.
 */
interface ThemedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}

export const ThemedCard: React.FC<ThemedCardProps> = ({ children, style, elevated = false }) => {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? colors.surfaceElevated : colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

/**
 * ThemedDivider - Auto dark mode border divider.
 */
export const ThemedDivider: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const { colors } = useAppTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border }, style]} />;
};

/**
 * ThemedSection - Auto dark mode surface section block.
 */
export const ThemedSection: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

/**
 * ThemedInputContainer - Auto dark mode input wrapper.
 */
export const ThemedInputContainer: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.inputContainer,
        {
          backgroundColor: colors.surfaceSubtle,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 8,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  inputContainer: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
