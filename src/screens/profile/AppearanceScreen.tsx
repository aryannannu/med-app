import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, ThemeMode } from '../../store/ThemeContext';
import { useToast } from '../../store/ToastContext';

export const AppearanceScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { themeMode, setThemeMode, colors } = useAppTheme();
  const { showToast } = useToast();

  const handleSelectTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    showToast(`Appearance updated to ${mode === 'system' ? 'System Default' : mode.charAt(0).toUpperCase() + mode.slice(1)}`, 'info');
  };

  const THEMES: { id: ThemeMode; title: string; subtitle: string; icon: string }[] = [
    {
      id: 'system',
      title: 'System Default',
      subtitle: 'Automatically matches your device display settings',
      icon: 'phone-portrait-outline',
    },
    {
      id: 'light',
      title: 'Light Mode',
      subtitle: 'Crisp, high-contrast daylight theme for optimal legibility',
      icon: 'sunny-outline',
    },
    {
      id: 'dark',
      title: 'Dark Mode',
      subtitle: 'Deep dark palette tailored for night reading and battery saving',
      icon: 'moon-outline',
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="titleMedium" color={colors.textPrimary} weight="600" style={styles.headerTitle}>
          Appearance
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AppText variant="bodySmall" color={colors.textSecondary} style={{ marginBottom: SPACING.md }}>
          Choose your preferred appearance mode for HEALIT. Changes apply instantly.
        </AppText>

        <View style={styles.optionsList}>
          {THEMES.map((t) => {
            const isSelected = themeMode === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                activeOpacity={0.85}
                onPress={() => handleSelectTheme(t.id)}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                  isSelected && { backgroundColor: colors.primarySubtle },
                  SHADOWS.subtle,
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: isSelected ? colors.primaryMuted : colors.surfaceSubtle },
                  ]}
                >
                  <Ionicons
                    name={t.icon as any}
                    size={22}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                </View>

                <View style={styles.infoCol}>
                  <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
                    {t.title}
                  </AppText>
                  <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                    {t.subtitle}
                  </AppText>
                </View>

                <Ionicons
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={isSelected ? colors.primary : colors.textMuted}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Brand Theme Info Card */}
        <View style={[styles.brandCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle]}>
          <View style={styles.brandBadge}>
            <Ionicons name="sparkles" size={16} color={colors.primary} />
            <AppText variant="caption" color={colors.primary} weight="600" style={{ marginLeft: 4 }}>
              HEALIT Design System
            </AppText>
          </View>
          <AppText variant="bodySmall" color={colors.textSecondary} style={{ marginTop: SPACING.sm }}>
            HEALIT uses curated #3A2986 brand accents with Lexend Deca typography designed for clear medicine labeling and effortless readability.
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 60,
  },
  optionsList: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1.5,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  brandCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

