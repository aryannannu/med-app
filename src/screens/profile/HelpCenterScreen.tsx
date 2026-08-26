import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useSupport } from '../../store/SupportContext';
import { useAppTheme } from '../../store/ThemeContext';

export const HelpCenterScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { colors, isDark } = useAppTheme();
  const { helpCategories, helpArticles } = useSupport();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredArticles = useMemo(() => {
    let list = helpArticles;
    if (selectedCategory) {
      list = list.filter((a) => a.categoryId === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.shortDescription.toLowerCase().includes(q) ||
          a.problemSummary.toLowerCase().includes(q)
      );
    }
    return list;
  }, [helpArticles, selectedCategory, searchQuery]);

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
          Help Center
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={[styles.searchBox, SHADOWS.subtle]}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search your issue (e.g. order, refund, rx)"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* 24x7 Live Support Banner */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ContactSupport')}
          style={[styles.supportBanner, SHADOWS.card]}
        >
          <View style={styles.bannerLeft}>
            <View style={styles.headsetIconBox}>
              <Ionicons name="headset" size={24} color="#FFFFFF" />
            </View>
            <View style={{ marginLeft: SPACING.md }}>
              <AppText variant="titleSmall" color="#FFFFFF" weight="600">
                24x7 Customer Helpline &amp; Chat
              </AppText>
              <AppText variant="caption" color="rgba(255, 255, 255, 0.85)">
                Instant support for active orders &amp; refunds
              </AppText>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Categories Grid */}
        <AppText variant="titleSmall" color={colors.textPrimary} weight="600" style={{ marginBottom: SPACING.sm }}>
          Browse by Category
        </AppText>

        <View style={styles.categoryGrid}>
          {helpCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(isSelected ? null : cat.id)}
                style={[
                  styles.categoryCard,
                  isSelected && styles.categoryCardActive,
                  SHADOWS.subtle,
                ]}
              >
                <View
                  style={[
                    styles.catIconCircle,
                    { backgroundColor: isSelected ? COLORS.primary : '#ECE8F7' },
                  ]}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={20}
                    color={isSelected ? '#FFFFFF' : COLORS.primary}
                  />
                </View>
                <AppText
                  variant="bodySmall"
                  color={colors.textPrimary}
                  weight="600"
                  numberOfLines={1}
                  style={{ marginTop: SPACING.xs }}
                >
                  {cat.title}
                </AppText>
                <AppText variant="caption" color={colors.textSecondary} style={{ fontSize: 11 }}>
                  {cat.articleCount} articles
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Articles List */}
        <View style={styles.articlesSection}>
          <AppText variant="titleSmall" color={colors.textPrimary} weight="600" style={{ marginBottom: SPACING.sm }}>
            {selectedCategory
              ? `${helpCategories.find((c) => c.id === selectedCategory)?.title} Questions`
              : 'Frequently Asked Questions'}
          </AppText>

          {filteredArticles.length === 0 ? (
            <View style={styles.emptyArticles}>
              <Ionicons name="help-circle-outline" size={36} color={colors.textMuted} />
              <AppText variant="bodyMedium" color={colors.textSecondary} style={{ marginTop: SPACING.xs }}>
                No matching help articles found.
              </AppText>
            </View>
          ) : (
            <View style={[styles.articlesCard, SHADOWS.subtle]}>
              {filteredArticles.map((art, idx) => (
                <React.Fragment key={art.id}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('HelpArticle', { articleId: art.id })}
                    style={styles.articleRow}
                  >
                    <View style={styles.articleTextCol}>
                      <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
                        {art.title}
                      </AppText>
                      <AppText variant="caption" color={colors.textSecondary} numberOfLines={2} style={{ marginTop: 2 }}>
                        {art.shortDescription}
                      </AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                  {idx < filteredArticles.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          )}
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  supportBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3A2986',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headsetIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  categoryCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FAF9FF',
  },
  catIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  articlesSection: {
    marginTop: SPACING.xs,
  },
  articlesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  articleTextCol: {
    flex: 1,
    marginRight: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8EE',
    marginHorizontal: SPACING.md,
  },
  emptyArticles: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
});




