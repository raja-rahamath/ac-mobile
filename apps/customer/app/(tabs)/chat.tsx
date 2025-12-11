import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';
import { sendChatMessage } from '../../src/services/chatService';
import type { ChatMessage } from '../../src/types';

const INITIAL_MESSAGE: ChatMessage = {
  id: '0',
  content: "Hello! I'm Fatima, your AgentCare assistant. How can I help you today? You can ask me about our services, submit a maintenance request, or get help with tracking your existing requests.",
  role: 'assistant',
  timestamp: new Date().toISOString(),
  agentName: 'Fatima',
  agentAvatar: 'F',
};

const SUGGESTIONS = [
  'Submit a new request',
  'Track my order',
  'What services do you offer?',
  'Talk to support',
];

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Voice input not available in Expo Go - show info alert
  const handleVoicePress = () => {
    Alert.alert(
      'Voice Input',
      'Voice input requires a development build. Text-to-speech is available - tap the speaker icon on any message to hear it read aloud.',
      [{ text: 'OK' }]
    );
  };

  // Text-to-speech for AI responses (supported in Expo Go)
  const speakMessage = async (text: string, messageId: string) => {
    if (isSpeaking && speakingMessageId === messageId) {
      Speech.stop();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      return;
    }

    if (isSpeaking) {
      Speech.stop();
    }

    setIsSpeaking(true);
    setSpeakingMessageId(messageId);

    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9,
      onDone: () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      },
      onError: () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      },
    });
  };

  const dynamicStyles = {
    container: { backgroundColor: isDark ? colors.backgroundDark : colors.background },
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    inputContainer: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
    input: {
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
      color: isDark ? colors.textDark : colors.text,
    },
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: text.trim(),
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Call the AI service
      const response = await sendChatMessage(text.trim());

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        agentName: 'Fatima',
        agentAvatar: 'F',
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      // Fallback to basic response on error
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or contact our support team for immediate assistance.",
        role: 'assistant',
        timestamp: new Date().toISOString(),
        agentName: 'Fatima',
        agentAvatar: 'F',
      };

      setMessages((prev) => [...prev, fallbackMessage]);
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    const isCurrentlySpeaking = isSpeaking && speakingMessageId === item.id;

    return (
      <View style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.agentAvatar || 'A'}</Text>
            </View>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : [styles.assistantBubble, dynamicStyles.inputContainer],
          ]}
        >
          {!isUser && (
            <View style={styles.messageHeader}>
              <Text style={styles.agentName}>{item.agentName}</Text>
              <TouchableOpacity
                style={styles.speakerButton}
                onPress={() => speakMessage(item.content, item.id)}
              >
                <Ionicons
                  name={isCurrentlySpeaking ? 'stop-circle' : 'volume-high'}
                  size={18}
                  color={isCurrentlySpeaking ? colors.error : colors.primary}
                />
              </TouchableOpacity>
            </View>
          )}
          <Text style={[styles.messageText, isUser ? styles.userMessageText : dynamicStyles.text]}>{item.content}</Text>
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : dynamicStyles.textMuted]}>
            {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, dynamicStyles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>F</Text>
                </View>
              </View>
              <View style={[styles.loadingBubble, dynamicStyles.inputContainer]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, dynamicStyles.textMuted]}>Fatima is typing...</Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Suggestions */}
      {messages.length === 1 && (
        <View style={styles.suggestionsContainer}>
          {SUGGESTIONS.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.suggestionChip, dynamicStyles.inputContainer]}
              onPress={() => sendMessage(suggestion)}
            >
              <Text style={[styles.suggestionText, { color: isDark ? colors.primaryLight : colors.primary }]}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputContainer, dynamicStyles.inputContainer]}>
        {/* Microphone Button - shows info in Expo Go */}
        <TouchableOpacity
          style={[styles.voiceButton, styles.voiceButtonDisabled]}
          onPress={handleVoicePress}
          disabled={isLoading}
        >
          <Ionicons
            name="mic"
            size={22}
            color={colors.textMuted}
          />
        </TouchableOpacity>

        <TextInput
          style={[styles.input, dynamicStyles.input]}
          placeholder="Type your message..."
          placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={() => sendMessage(inputText)}
          disabled={!inputText.trim() || isLoading}
        >
          <Ionicons name="send" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messagesList: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    marginRight: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  agentName: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  speakerButton: {
    padding: 4,
  },
  messageText: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.white,
  },
  timestamp: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: colors.white,
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: fontSize.sm,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.sm,
  },
  suggestionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    fontSize: fontSize.md,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonDisabled: {
    borderColor: colors.textMuted,
    opacity: 0.6,
  },
});
