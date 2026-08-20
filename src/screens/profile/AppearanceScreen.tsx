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
  const { themeMode, setThemeMode } = useAppTheme();
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
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600" style={styles.headerTitle}>
          Appearance
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AppText variant="bodySmall" color={COLORS.textSecondary} style={{ marginBottom: SPACING.md }}>
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
                  isSelected && styles.optionCardActive,
                  SHADOWS.subtle,
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: isSelected ? '#ECE8F7' : '#F8F8FC' },
                  ]}
                >
                  <Ionicons
                    name={t.icon as any}
                    size={22}
                    color={isSelected ? COLORS.primary : COLORS.textSecondary}
                  />
                </View>

                <View style={styles.infoCol}>
                  <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                    {t.title}
                  </AppText>
                  <AppText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
                    {t.subtitle}
                  </AppText>
                </View>

                <Ionicons
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={isSelected ? COLORS.primary : COLORS.textMuted}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Brand Theme Info Card */}
        <View style={[styles.brandCard, SHADOWS.subtle]}>
          <View style={styles.brandBadge}>
            <Ionicons name="sparkles" size={16} color={COLORS.primary} />
            <AppText variant="caption" color={COLORS.primary} weight="600" style={{ marginLeft: 4 }}>
              HEALIT Design System
            </AppText>
          </View>
          <AppText variant="bodySmall" color={COLORS.textSecondary} style={{ marginTop: SPACING.sm }}>
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
    backgroundColor: '#F8F8FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EE',
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
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: '#E8E8EE',
  },
  optionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FAF9FF',
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
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
