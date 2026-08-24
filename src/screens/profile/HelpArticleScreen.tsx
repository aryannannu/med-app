import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { useSupport } from '../../store/SupportContext';
import { useToast } from '../../store/ToastContext';
import { useAppTheme } from '../../store/ThemeContext';

export const HelpArticleScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'HelpArticle'>>();
  const { getArticleById } = useSupport();
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();

  const article = getArticleById(route.params?.articleId || 'art-1');
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);

  if (!article) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <AppText variant="titleMedium" color={colors.textPrimary} weight="600">
            Article Not Found
          </AppText>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.notFoundContainer}>
          <AppText variant="bodyMedium" color={colors.textSecondary}>
            This help article could not be loaded.
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  const handleActionClick = () => {
    if (article.actionRoute) {
      navigation.navigate(article.actionRoute as any, article.actionParams);
    }
  };

  const handleFeedback = (type: 'yes' | 'no') => {
    setFeedbackGiven(type);
    showToast(
      type === 'yes'
        ? 'Glad we could help!'
        : 'Thank you for your feedback. We are improving this article.',
      'info'
    );
  };

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
          Help Article
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <AppText variant="h3" color={colors.textPrimary} weight="600" style={{ marginBottom: SPACING.md }}>
          {article.title}
        </AppText>

        {/* Problem Summary Card */}
        <View style={[styles.summaryCard, SHADOWS.subtle]}>
          <View style={styles.summaryIconBox}>
            <Ionicons name="information-circle" size={22} color={colors.primary} />
          </View>
          <AppText variant="bodySmall" color={colors.textPrimary} style={{ flex: 1, marginLeft: SPACING.sm }}>
            {article.problemSummary}
          </AppText>
        </View>

        {/* Step-by-step resolution */}
        <View style={[styles.stepsCard, SHADOWS.subtle]}>
          <AppText variant="titleSmall" color={colors.textPrimary} weight="600" style={{ marginBottom: SPACING.md }}>
            Resolution Steps
          </AppText>

          {article.steps.map((step, idx) => (
            <View key={idx} style={styles.stepRow}>
              <View style={styles.stepNumberBadge}>
                <AppText variant="caption" color="#FFFFFF" weight="600">
                  {idx + 1}
                </AppText>
              </View>
              <AppText variant="bodySmall" color={colors.textPrimary} style={{ flex: 1, marginLeft: SPACING.md }}>
                {step}
              </AppText>
            </View>
          ))}
        </View>

        {/* Contextual Action Button */}
        {article.actionLabel && (
          <AppButton
            title={article.actionLabel}
            variant="primary"
            size="lg"
            onPress={handleActionClick}
            rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
            style={{ marginBottom: SPACING.xl }}
          />
        )}

        {/* Feedback Card */}
        <View style={[styles.feedbackCard, SHADOWS.subtle]}>
          <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
            Was this article helpful?
          </AppText>
          {feedbackGiven ? (
            <View style={styles.feedbackGivenBox}>
              <Ionicons name="checkmark-circle" size={16} color="#15803D" />
              <AppText variant="caption" color="#15803D" weight="600" style={{ marginLeft: 4 }}>
                Thank you for your feedback!
              </AppText>
            </View>
          ) : (
            <View style={styles.feedbackButtonsRow}>
              <TouchableOpacity
                onPress={() => handleFeedback('yes')}
                style={[styles.feedbackBtn, { borderColor: '#15803D' }]}
              >
                <Ionicons name="thumbs-up-outline" size={16} color="#15803D" />
                <AppText variant="caption" color="#15803D" weight="600" style={{ marginLeft: 4 }}>
                  Yes, it helped
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleFeedback('no')}
                style={[styles.feedbackBtn, { borderColor: COLORS.textMuted }]}
              >
                <Ionicons name="thumbs-down-outline" size={16} color={colors.textSecondary} />
                <AppText variant="caption" color={colors.textSecondary} weight="600" style={{ marginLeft: 4 }}>
                  No
                </AppText>
              </TouchableOpacity>
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
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECE8F7',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#DCD5F0',
  },
  summaryIconBox: {
    marginTop: 2,
  },
  stepsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.xl,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  feedbackButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  feedbackGivenBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});



