import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useSupport } from '../../store/SupportContext';
import { useAppTheme } from '../../store/ThemeContext';
import { formatDateTime } from '../../utils/formatters';

export const SupportChatScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { colors, isDark } = useAppTheme();
  const route = useRoute<RouteProp<AppStackParamList, 'SupportChat'>>();
  const { chatMessages, sendMessage } = useSupport();

  const [inputMessage, setInputMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const orderId = route.params?.orderId;

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chatMessages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    setInputMessage('');
    await sendMessage(text, orderId);
  };

  const QUICK_PROMPTS = [
    'Where is my active order?',
    'I want to cancel my order',
    'How do I get an instant refund?',
    'Prescription verification query',
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

        <View style={styles.agentInfoCol}>
          <View style={styles.agentTitleRow}>
            <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
              HEALIT Support (Priya)
            </AppText>
            <View style={styles.onlineDot} />
          </View>
          <AppText variant="caption" color="#15803D" weight="600" style={{ fontSize: 11 }}>
            Online • Replies in &lt; 1 min
          </AppText>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('HelpCenter')}
          style={styles.backBtn}
        >
          <Ionicons name="help-circle-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Order Banner if applicable */}
          {orderId && (
            <View style={styles.orderContextBanner}>
              <Ionicons name="receipt-outline" size={16} color={colors.primary} />
              <AppText variant="caption" color={colors.textPrimary} weight="600" style={{ marginLeft: 6 }}>
                Chat regarding Order #{orderId.toUpperCase()}
              </AppText>
            </View>
          )}

          {/* Messages */}
          {chatMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSystem = msg.sender === 'system';

            if (isSystem) {
              return (
                <View key={msg.id} style={styles.systemMessageRow}>
                  <View style={styles.systemBubble}>
                    <AppText variant="caption" color={colors.textSecondary} align="center">
                      {msg.text}
                    </AppText>
                  </View>
                </View>
              );
            }

            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isUser ? styles.messageRowUser : styles.messageRowSupport,
                ]}
              >
                {!isUser && (
                  <View style={styles.supportAvatar}>
                    <Ionicons name="headset" size={14} color="#FFFFFF" />
                  </View>
                )}

                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.supportBubble,
                    SHADOWS.subtle,
                  ]}
                >
                  <AppText
                    variant="bodySmall"
                    color={isUser ? '#FFFFFF' : COLORS.textPrimary}
                    style={{ lineHeight: 20 }}
                  >
                    {msg.text}
                  </AppText>
                  <AppText
                    variant="caption"
                    color={isUser ? 'rgba(255, 255, 255, 0.75)' : COLORS.textMuted}
                    align={isUser ? 'right' : 'left'}
                    style={{ marginTop: 4, fontSize: 10 }}
                  >
                    {formatDateTime(msg.timestamp).split(',')[1]}
                  </AppText>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Quick Prompts Chips */}
        <View style={styles.quickPromptsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptsScroll}>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                onPress={() => handleSend(prompt)}
                style={styles.promptChip}
              >
                <AppText variant="caption" color={colors.primary} weight="600">
                  {prompt}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Message Input Bar */}
        <View style={[styles.inputBar, SHADOWS.modal]}>
          <TextInput
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Type your message..."
            placeholderTextColor={colors.textMuted}
            style={styles.textInput}
          />
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleSend()}
            disabled={!inputMessage.trim()}
            style={[
              styles.sendBtn,
              { backgroundColor: inputMessage.trim() ? COLORS.primary : '#E8E8EE' },
            ]}
          >
            <Ionicons
              name="send"
              size={18}
              color={inputMessage.trim() ? '#FFFFFF' : COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  agentInfoCol: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  agentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#15803D',
    marginLeft: 6,
  },
  messagesContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.md,
  },
  orderContextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECE8F7',
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  systemMessageRow: {
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  systemBubble: {
    backgroundColor: '#E8E8EE',
    paddingVertical: 4,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    maxWidth: '85%',
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowSupport: {
    justifyContent: 'flex-start',
  },
  supportAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.lg,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2,
  },
  supportBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    borderBottomLeftRadius: 2,
  },
  quickPromptsContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8EE',
    paddingVertical: 8,
  },
  promptsScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  promptChip: {
    backgroundColor: '#ECE8F7',
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#DCD5F0',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#E8E8EE',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
});




