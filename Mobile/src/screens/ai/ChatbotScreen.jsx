import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../../styles/theme';
import { chatService } from '../../api/services/chatService';
import { Header } from '../../components/ui/Header';
import { Send, Bot, User, Sparkles } from 'lucide-react-native';

export function ChatbotScreen({ navigation }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Chào bạn! Mình là Trợ lý Dinh dưỡng VeggieAI 🥦. Bạn cần tư vấn về thực đơn chay, chất dinh dưỡng hay cách chế biến món ăn nào?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const flatListRef = useRef(null);

  // Khởi tạo phiên trò chuyện
  useEffect(() => {
    let mounted = true;
    chatService.createSession()
      .then((session) => {
        if (mounted && session?.id) {
          setSessionId(session.id);
        }
      })
      .catch((err) => console.warn('Lỗi tạo session chat:', err));
    return () => { mounted = false; };
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: String(Date.now()), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      if (!sessionId) {
        const session = await chatService.createSession();
        setSessionId(session.id);
        const reply = await chatService.sendMessage(session.id, text);
        const aiMsg = {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: reply?.aiMessage?.content || reply?.content || 'Xin lỗi, mình chưa thể trả lời lúc này.',
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const reply = await chatService.sendMessage(sessionId, text);
        const aiMsg = {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: reply?.aiMessage?.content || reply?.content || 'Xin lỗi, mình chưa thể trả lời lúc này.',
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: 'Không thể kết nối đến trợ lý AI. Vui lòng kiểm tra lại mạng!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Header title="Trợ Lý Dinh Dưỡng AI" onBack={() => navigation.goBack()} />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isUser = item.role === 'user';
          return (
            <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAi]}>
              {!isUser && (
                <View style={styles.aiAvatar}>
                  <Bot size={16} color="#ffffff" />
                </View>
              )}
              <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
                <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAi]}>
                  {item.content}
                </Text>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          loading ? (
            <View style={styles.typingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.typingText}>VeggieAI đang suy nghĩ câu trả lời...</Text>
            </View>
          ) : null
        }
      />

      {/* Thanh gõ tin nhắn */}
      <View style={styles.inputBar}>
        <TextInput
          placeholder="Hỏi trợ lý (VD: Nguồn nạp B12 cho người ăn chay?)..."
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && { opacity: 0.5 }]}
          onPress={handleSend}
          disabled={!input.trim() || loading}
        >
          <Send size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  messageList: {
    padding: theme.spacing.md,
    paddingBottom: 20,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowAi: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.lg,
  },
  bubbleUser: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 2,
  },
  bubbleAi: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  msgTextUser: {
    color: '#ffffff',
  },
  msgTextAi: {
    color: theme.colors.textPrimary,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: theme.colors.background,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginRight: 8,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
