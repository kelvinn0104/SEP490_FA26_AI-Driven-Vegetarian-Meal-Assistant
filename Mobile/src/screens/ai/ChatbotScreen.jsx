import React, { useRef, useState } from 'react';
import { FlatList, Text, TextInput, View, StyleSheet } from 'react-native';
import { History, MessageCircle, Plus, Send } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../../api/services/chatService';
import { useAuthStore } from '../../store/useAuthStore';
import { Frame, Page, Title, GuestGate, Empty, Notice, Pending, QueryState, RowLink, ui } from '../../components/ui/Kit';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/Header';
import { Readable } from '../../components/ui/Readable';
import { c } from '../../styles/theme';
import { chatUnavailable, listOf } from '../../styles/content.mjs';

export function ChatbotScreen({ navigation }) {
  const signedIn = useAuthStore(state => !!state.token);
  if (!signedIn) return <Page title="Trợ lý bếp" back={navigation.goBack}>
    <GuestGate navigation={navigation} icon={MessageCircle} title="Hỏi trợ lý bếp"
      detail="Đăng nhập để hỏi về món chay và xem lại cuộc trò chuyện." />
  </Page>;
  return <Chat navigation={navigation} />;
}

function Chat({ navigation }) {
  const client = useQueryClient();
  const list = useRef(null);
  const composer = useRef(null);
  const [session, setSession] = useState(null);
  const [history, setHistory] = useState(false);
  const [drafts, setDrafts] = useState({});
  const draftKey = session ?? 'new';
  const draft = drafts[draftKey] || '';
  const change = text => setDrafts(previous => ({ ...previous, [draftKey]: text }));
  const sessions = useQuery({ queryKey: ['chat-sessions'], queryFn: ({ signal }) => chatService.getSessions(signal), enabled: history });
  const transcript = useQuery({ queryKey: ['chat', session], queryFn: ({ signal }) => chatService.getMessages(session, signal), enabled: !!session && !history });
  const messages = listOf(transcript.data).filter(message => message.sender === 'user' || !chatUnavailable(message.content));
  const send = useMutation({
    mutationFn: async () => {
      const content = draft.trim();
      let id = session;
      if (!id) {
        id = (await chatService.createSession())?.id;
        if (!id) throw new Error('Chưa tạo được cuộc trò chuyện.');
        client.setQueryData(['chat', id], []);
        setDrafts(previous => ({ ...previous, [id]: draft, new: '' }));
        setSession(id);
      }
      const reply = await chatService.sendMessage(id, content);
      if (chatUnavailable(reply?.aiMessage?.content)) {
        client.invalidateQueries({ queryKey: ['chat-sessions'] });
        throw new Error('Trợ lý chưa phản hồi. Câu hỏi vẫn được giữ để bạn thử lại.');
      }
      return { id, reply };
    },
    onSuccess: ({ id, reply }) => {
      client.setQueryData(['chat', id], previous => [...listOf(previous), reply.userMessage, reply.aiMessage].filter(Boolean));
      setDrafts(previous => ({ ...previous, [id]: '' }));
      client.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
  const reset = () => {
    send.reset();
    setSession(null);
    setDrafts(previous => ({ ...previous, new: '' }));
    setHistory(false);
  };
  const submit = () => {
    if (draft.trim() && !send.isPending && (!session || transcript.isSuccess)) send.mutate();
  };

  if (history) return <Page title="Cuộc trò chuyện" back={() => setHistory(false)}>
    <Button title="Cuộc trò chuyện mới" icon={Plus} onPress={reset} />
    <QueryState query={sessions}>
      {!listOf(sessions.data).length && <Empty title="Chưa có cuộc trò chuyện" icon={MessageCircle} />}
      {listOf(sessions.data).map(item => <View key={item.id} style={ui.card}>
        <RowLink icon={MessageCircle} label={chatUnavailable(item.lastMessage) ? 'Chưa có phản hồi' : item.lastMessage.replace(/[*_#]/g, '').slice(0, 100)}
          detail={item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : undefined}
          onPress={() => { send.reset(); setSession(item.id); setHistory(false); }} />
      </View>)}
    </QueryState>
  </Page>;

  return <Frame title="Trợ lý bếp" back={navigation.goBack} keyboard action={<View style={ui.row}>
    <IconButton label="Lịch sử chat" icon={History} disabled={send.isPending} onPress={() => setHistory(true)} />
    <IconButton label="Cuộc trò chuyện mới" icon={Plus} disabled={send.isPending} onPress={reset} />
  </View>}>
    <FlatList ref={list} data={messages} style={ui.fill} contentContainerStyle={s.list}
      keyboardShouldPersistTaps="handled" keyExtractor={(item, index) => String(item.id ?? index)}
      onContentSizeChange={() => { if (!history && messages.length) list.current?.scrollToEnd({ animated: false }); }}
      ListEmptyComponent={session && !transcript.isSuccess ? <QueryState query={transcript} /> : <View style={s.suggestions}>
        <Title title="Bạn muốn nấu gì?" detail="Hỏi cách nấu, thay nguyên liệu hoặc tìm món từ những gì đang có." />
        {['Gợi ý bữa tối với đậu hũ', 'Thay trứng khi làm bánh'].map(prompt => <RowLink key={prompt} label={prompt}
          onPress={() => { if (!send.isPending) { change(prompt); composer.current?.focus(); } }} />)}
      </View>}
      renderItem={({ item }) => <View style={[s.bubble, item.sender === 'user' ? s.own : s.answer]}>
        <Text style={ui.eyebrow}>{item.sender === 'user' ? 'Bạn' : 'Trợ lý'}</Text>
        {item.sender === 'user' ? <Text style={[ui.body, { color: c.ink }]}>{item.content}</Text> : <Readable content={item.content} />}
      </View>}
      ListFooterComponent={send.isPending ? <Pending label="Đang chờ trợ lý trả lời…" /> : null}
    />
    <View style={s.composer}>
      <Notice error>{send.error?.message}</Notice>
      <View style={s.inputRow}>
        <TextInput ref={composer} accessibilityLabel="Tin nhắn" placeholder="Hỏi trợ lý bếp…" placeholderTextColor={c.muted} maxLength={2000}
          editable={!send.isPending} multiline value={draft} onChangeText={change} style={[ui.input, ui.fill, { maxHeight: 125 }]} />
        <IconButton label="Gửi tin nhắn" icon={Send} disabled={!draft.trim() || send.isPending || (!!session && !transcript.isSuccess)} onPress={submit} />
      </View>
      <Text style={ui.small}>Kiểm tra lại thông tin dị ứng và dinh dưỡng trước khi áp dụng.</Text>
    </View>
  </Frame>;
}
const s = StyleSheet.create({
  list: { ...ui.content, flexGrow: 1, justifyContent: 'flex-end', gap: 12 },
  suggestions: { ...ui.card, backgroundColor: c.primaryLight },
  bubble: { padding: 13, gap: 7, borderRadius: 16, maxWidth: '96%', borderWidth: 1, borderColor: c.line },
  own: { alignSelf: 'flex-end', backgroundColor: c.stone, borderBottomRightRadius: 4 },
  answer: { alignSelf: 'flex-start', backgroundColor: c.surface, borderBottomLeftRadius: 4 },
  composer: { padding: 12, gap: 8, backgroundColor: c.surface, borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.line },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
});
