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
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';
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

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        'Submit a new request':
          "I'd be happy to help you submit a new service request! What type of service do you need? We offer:\n\n• Plumbing\n• Electrical\n• AC/HVAC\n• Appliance repair\n• Cleaning\n• General maintenance",
        'Track my order':
          "I can help you track your service request. Looking at your account, you have one active request:\n\n📋 AC Repair - In Progress\n🏠 Villa 23, Palm Jumeirah\n👷 Technician: Ahmed Hassan\n📅 Scheduled: Today at 10:00 AM\n\nWould you like to track the technician's location?",
        'What services do you offer?':
          'AgentCare provides comprehensive maintenance services including:\n\n🔧 Plumbing - leaks, clogs, installations\n⚡ Electrical - wiring, fixtures, repairs\n❄️ AC/HVAC - maintenance, repairs, installations\n📺 Appliance Repair - all major brands\n🧹 Cleaning - regular and deep cleaning\n🏠 General Maintenance - painting, carpentry\n\nAll our technicians are certified and background-checked!',
        'Talk to support':
          "I'm here to help! If you need to speak with a human agent, I can connect you. Our support team is available:\n\n📞 Phone: +971 4 123 4567\n💬 Live Chat: Available 24/7\n📧 Email: support@agentcare.com\n\nWould you like me to transfer you to a live agent?",
      };

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content:
          responses[text] ||
          "Thank you for your message! I understand you need assistance. Could you please provide more details about what you're looking for? I can help you with:\n\n• Submitting service requests\n• Tracking existing requests\n• Information about our services\n• Connecting with support",
        role: 'assistant',
        timestamp: new Date().toISOString(),
        agentName: 'Fatima',
        agentAvatar: 'F',
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';

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
          {!isUser && <Text style={styles.agentName}>{item.agentName}</Text>}
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>{item.content}</Text>
          <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
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
              <Text style={[styles.suggestionText, { color: colors.primary }]}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputContainer, dynamicStyles.inputContainer]}>
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
  agentName: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    marginBottom: 4,
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
});
