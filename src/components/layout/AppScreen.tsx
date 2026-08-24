import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ViewStyle,
  RefreshControl,
} from 'react-native';
import { COLORS, SPACING } from '../../theme';
import { useAppTheme } from '../../store/ThemeContext';

export interface AppScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  backgroundColor?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const AppScreen: React.FC<AppScreenProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  backgroundColor,
  refreshing = false,
  onRefresh,
  header,
  footer,
}) => {
  const { colors, isDark } = useAppTheme();
  const resolvedBg = backgroundColor && backgroundColor !== COLORS.background ? backgroundColor : colors.background;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: resolvedBg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={resolvedBg} />
      {header}

      {scrollable ? (
        <ScrollView
          style={[styles.container, { backgroundColor: resolvedBg }, style]}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.container, styles.flex, { backgroundColor: resolvedBg }, style]}>{children}</View>
      )}

      {footer}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  flex: {
    paddingHorizontal: SPACING.lg,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
});
