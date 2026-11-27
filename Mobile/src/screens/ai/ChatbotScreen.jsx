import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, FlatList, Keyboard, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { CalendarDays, History, Leaf, MessageCircle, Plus, ScanLine, Send, X } from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../../api/services/chatService';
import { useAuthStore } from '../../store/useAuthStore';
import { Empty, Frame, GuestGate, Notice, Page, Pending, QueryState, RowLink, ui } from '../../components/ui/Kit';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/Header';
import { Readable } from '../../components/ui/Readable';
import { c } from '../../styles/theme';
import { chatContent, chatUnavailable, listOf } from '../../styles/content.mjs';

const LIMIT = 2000;
const scanFooter = '\n\nNguyên liệu đã xác nhận từ ảnh: ';
const sourcesFooter = '\n\n**Nguồn tham khảo:**\n';

export function ChatbotScreen(props) {
  const signedIn = useAuthStore(state => !!state.token);
  if (!signedIn) return <Page title="Trợ lý bếp" tab>
    <View style={s.welcome}>
      <Leaf size={25} color={c.lime} />
      <Text accessibilityRole="header" style={s.welcomeTitle}>Có gì trong bếp?</Text>
      <Text style={s.welcomeCopy}>Hỏi công thức, quét nguyên liệu hoặc lên thực đơn tuần.</Text>
    </View>
    <GuestGate navigation={props.navigation} icon={MessageCircle} title="Bắt đầu trò chuyện"
      detail="Đăng nhập để dùng trợ lý và giữ lại các cuộc trò chuyện." />
  </Page>;
  return <Chat {...props} />;
}

function Chat({ navigation, route }) {
  const client = useQueryClient();
  const focused = useIsFocused();
  const list = useRef(null);
  const input = useRef(null);
  const atBottom = useRef(true);
  const sending = useRef(false);
  const unsettled = useRef(new Map());
  const [session, setSession] = useState(null);
  const [planId, setPlanId] = useState(null);
  const [history, setHistory] = useState(false);
  const [drafts, setDrafts] = useState({});
  const [attachments, setAttachments] = useState({});
  const key = session ?? 'new';
  const draft = drafts[key] || '';
  const attachment = attachments[key];
  const content = chatContent(draft, attachment);
  const maxQuestion = Math.max(0, LIMIT - (attachment ? chatContent('x', attachment).length - 1 : 0));
  const canFit = content.length <= LIMIT;
  const sessions = useQuery({ queryKey: ['chat-sessions'], queryFn: ({ signal }) => chatService.getSessions(signal), enabled: history && focused });
  const transcript = useQuery({
    queryKey: ['chat', session], queryFn: ({ signal }) => chatService.getMessages(session, signal),
    enabled: !!session && focused && !history,
    staleTime: Infinity,
  });
  const messages = listOf(transcript.data).filter(message => message.sender === 'user' || !chatUnavailable(message.content));

  useEffect(() => {
    if (!route.params?.scanAttachment) return;
    setAttachments(previous => ({ ...previous, [key]: route.params.scanAttachment }));
    setHistory(false);
    navigation.setParams({ scanAttachment: undefined });
  }, [route.params?.scanAttachment, key, navigation]);

  useEffect(() => {
    if (!history || !focused) return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => { setHistory(false); return true; });
    return () => listener.remove();
  }, [history, focused]);

  const send = useMutation({
    mutationFn: async ({ text, original, scan, id, linkedPlan }) => {
      if (!id) {
        id = (await chatService.createSession(linkedPlan))?.id;
        if (!id) throw new Error('Chưa tạo được cuộc trò chuyện.');
        client.setQueryData(['chat', id], []);
        setDrafts(previous => ({ ...previous, [id]: original, new: '' }));
        setAttachments(previous => ({ ...previous, [id]: scan, new: undefined }));
        setSession(id);
      }

      const chatKey = ['chat', id];
      await client.cancelQueries({ queryKey: chatKey });
      const previousSend = unsettled.current.get(id);
      if (previousSend?.text === text) {
        const saved = listOf(await chatService.getMessages(id));
        const index = saved.findIndex(message => message.sender === 'user' &&
          message.content === text && !previousSend.before.has(message.id));
        if (index >= 0) {
          const next = saved[index + 1];
          client.setQueryData(chatKey, saved);
          if (!next) throw new Error('Câu hỏi đã được máy chủ nhận. Thử lại sau để tải câu trả lời.');
          if (next.sender === 'ai' && !chatUnavailable(next.content)) return { id, saved };
        }
      }

      const before = new Set(listOf(client.getQueryData(chatKey)).map(message => message.id));
      unsettled.current.set(id, { text, before });
      try {
        const reply = await chatService.sendMessage(id, text);
        if (!reply?.userMessage || chatUnavailable(reply.aiMessage?.content)) {
          throw new Error('Trợ lý chưa phản hồi. Bạn có thể gửi lại câu hỏi.');
        }
        return { id, reply };
      } catch (error) {
        // An API rejection is definitive. A broken connection can hide a completed reply.
        if (error.status && ![502, 504].includes(error.status)) unsettled.current.delete(id);
        throw error;
      }
    },
    onSuccess: ({ id, reply, saved }) => {
      if (reply) client.setQueryData(['chat', id], previous => [
        ...listOf(previous).filter(message => message.id !== reply.userMessage.id && message.id !== reply.aiMessage.id),
        reply.userMessage, { ...reply.aiMessage, citations: reply.citations },
      ]);
      else client.setQueryData(['chat', id], saved);
      unsettled.current.delete(id);
      setDrafts(previous => ({ ...previous, [id]: '' }));
      setAttachments(previous => ({ ...previous, [id]: undefined }));
    },
    onSettled: () => {
      sending.current = false;
      client.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });

  useEffect(() => {
    if (!route.params?.planId || send.isPending) return;
    setSession(null);
    setPlanId(route.params.planId);
    setHistory(false);
    atBottom.current = true;
    send.reset();
    navigation.setParams({ planId: undefined });
  }, [route.params?.planId, send.isPending, navigation]);

  function startNew() {
    Keyboard.dismiss();
    send.reset();
    setSession(null);
    setPlanId(null);
    setHistory(false);
    atBottom.current = true;
  }

  function submit() {
    if (sending.current || !draft.trim() || !canFit || (session && transcript.data === undefined)) return;
    sending.current = true;
    atBottom.current = true;
    Keyboard.dismiss();
    send.mutate({ text: content, original: draft, scan: attachment, id: session, linkedPlan: planId });
  }

  if (history) return <Page title="Cuộc trò chuyện" back={() => setHistory(false)} tab>
    <Button title="Cuộc trò chuyện mới" icon={Plus} onPress={startNew} />
    <QueryState query={sessions}>
      {!listOf(sessions.data).length && <Empty title="Chưa có cuộc trò chuyện" icon={MessageCircle} />}
      <View style={s.threadList}>
        {listOf(sessions.data).map(item => <RowLink key={item.id} icon={MessageCircle}
          label={chatUnavailable(item.lastMessage) ? 'Cuộc trò chuyện mới' : item.lastMessage.replace(/[*_#]/g, '').trim()}
          detail={item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : undefined}
          onPress={() => { send.reset(); atBottom.current = true; setSession(item.id); setPlanId(item.planId); setHistory(false); }} />)}
      </View>
    </QueryState>
  </Page>;

  const openScan = () => { Keyboard.dismiss(); navigation.navigate('VisionScan'); };
  const openPlanner = () => navigation.navigate('PlannerTab', { createRequestedAt: Date.now(), scanId: undefined });
  const change = text => setDrafts(previous => ({ ...previous, [key]: text }));
  const scrollToEnd = () => { if (atBottom.current) list.current?.scrollToEnd({ animated: false }); };
  const last = messages.at(-1);
  const alreadyVisible = last?.sender === 'user' && last.content === send.variables?.text;
  const cannotSend = send.isPending || !draft.trim() || !canFit || (!!session && transcript.data === undefined);
  return <Frame title="Trợ lý bếp" tab keyboard action={<View style={s.headerActions}>
    <IconButton label="Lịch sử chat" icon={History} disabled={send.isPending} onPress={() => { Keyboard.dismiss(); setHistory(true); }} />
    <IconButton label="Cuộc trò chuyện mới" icon={Plus} disabled={send.isPending} onPress={startNew} />
  </View>}>
    <FlatList key={key} ref={list} data={messages} style={ui.fill} contentContainerStyle={s.timeline}
      keyboardShouldPersistTaps="handled" onContentSizeChange={scrollToEnd}
      refreshControl={session ? <RefreshControl refreshing={transcript.isRefetching} onRefresh={transcript.refetch}
        enabled={!send.isPending} colors={[c.primary]} /> : undefined}
      onScroll={({ nativeEvent: { contentOffset, contentSize, layoutMeasurement } }) => {
        atBottom.current = contentSize.height - layoutMeasurement.height - contentOffset.y < 90;
      }} scrollEventThrottle={32} keyExtractor={item => String(item.id)}
      ListEmptyComponent={session && transcript.data === undefined ? <QueryState query={transcript} /> : !send.isPending && <View style={s.start}>
        <View style={s.welcome}>
          <Leaf size={25} color={c.lime} />
          <Text accessibilityRole="header" style={s.welcomeTitle}>Có gì trong bếp?</Text>
          <Text style={s.welcomeCopy}>Hỏi cách nấu hoặc bắt đầu với nguyên liệu bạn đang có.</Text>
        </View>
        <RowLink label="Gợi ý bữa tối với đậu hũ" icon={MessageCircle}
          onPress={() => { change('Gợi ý bữa tối với đậu hũ'); input.current?.focus(); }} />
        <RowLink label="Lên thực đơn tuần" icon={CalendarDays} onPress={openPlanner} />
        <RowLink label="Quét nguyên liệu" icon={ScanLine} onPress={openScan} />
      </View>}
      renderItem={({ item }) => <Message item={item} navigation={navigation} />}
      ListFooterComponent={send.isPending && !alreadyVisible
        ? <View style={ui.group}>
          <Message item={{ sender: 'user', content: send.variables?.text }} navigation={navigation} />
          <Pending label="Đang chờ trợ lý trả lời…" />
        </View> : send.isPending ? <Pending label="Đang kiểm tra tin nhắn…" /> : null}
    />
    <View style={s.tray}>
      <View style={s.composer}>
        <Notice error>{send.error?.message || (!canFit ? 'Rút ngắn câu hỏi để gửi kèm nguyên liệu.' : '')}</Notice>
        {planId != null && <Text style={ui.small}>Đang hỏi về thực đơn đã chọn</Text>}
        {attachment && <View style={s.attachment}>
          <ScanLine size={19} color={c.primary} />
          <View style={ui.fill}>
            <Text style={ui.label}>Nguyên liệu đã xác nhận</Text>
            <Text style={ui.small} numberOfLines={2}>{attachment.ingredients.join(', ')}</Text>
          </View>
          <IconButton label="Bỏ nguyên liệu đính kèm" icon={X} disabled={send.isPending}
            onPress={() => setAttachments(previous => ({ ...previous, [key]: undefined }))} />
        </View>}
        <View style={s.inputRow}>
          <IconButton label="Mở quét ảnh" icon={ScanLine} disabled={send.isPending} onPress={openScan} />
          <TextInput ref={input} accessibilityLabel="Tin nhắn" placeholder="Nhắn cho trợ lý…" placeholderTextColor={c.muted}
            selectionColor={c.primary} maxLength={maxQuestion} editable={!send.isPending} multiline value={draft}
            onChangeText={change} style={[ui.input, ui.fill, s.input]} />
          <Pressable accessibilityRole="button" accessibilityLabel="Gửi tin nhắn"
            accessibilityState={{ busy: send.isPending, disabled: cannotSend }} disabled={cannotSend}
            onPress={submit} style={({ pressed }) => [s.send, (pressed || cannotSend) && s.sendMuted]}>
            <Send size={20} color={c.surface} />
          </Pressable>
        </View>
      </View>
    </View>
  </Frame>;
}

function Message({ item, navigation }) {
  const own = item.sender === 'user';
  const cites = item.citations || [];
  const [text, ingredients] = own ? String(item.content ?? '').split(scanFooter, 2) : [item.content];
  return <View style={[s.bubble, own ? s.own : s.answer]}>
    {own ? <>
      <Text style={s.ownText}>{text}</Text>
      {!!ingredients && <Text style={s.ownAttachment}>{ingredients}</Text>}
    </> : <>
      <View style={ui.row}><Leaf color={c.primary} size={15} /><Text style={ui.label}>Trợ lý bếp</Text></View>
      <Readable content={cites.length ? String(text).split(sourcesFooter, 1)[0] : text} />
      {cites.length > 0 && <View style={s.sources}>
        <Text style={ui.label}>Nguồn tham khảo</Text>
        {cites.map(source => source.type === 'recipe'
          ? <RowLink key={source.index} label={source.title} onPress={() => navigation.navigate('RecipeDetail', { recipeId: source.id })} />
          : <Text key={source.index} style={ui.body}>{source.title}</Text>)}
      </View>}
    </>}
  </View>;
}

const s = StyleSheet.create({
  headerActions: { flexDirection: 'row', gap: 6 },
  timeline: { ...ui.content, flexGrow: 1, paddingBottom: 12, gap: 12 },
  start: { gap: 2 },
  welcome: { marginBottom: 8, borderRadius: 20, padding: 20, gap: 9, backgroundColor: c.primaryDark },
  welcomeTitle: { fontFamily: 'serif', fontSize: 32, color: c.surface, letterSpacing: -0.6 },
  welcomeCopy: { color: c.primaryLight, fontSize: 15, lineHeight: 22 },
  threadList: { backgroundColor: c.surface, borderRadius: 16, paddingHorizontal: 8 },
  bubble: { padding: 14, gap: 8, borderRadius: 17 },
  own: { maxWidth: '88%', alignSelf: 'flex-end', backgroundColor: c.primary, borderBottomRightRadius: 4 },
  ownText: { color: c.surface, fontSize: 15, lineHeight: 22 },
  ownAttachment: { color: c.primaryLight, fontSize: 13, lineHeight: 19, borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: c.primaryLight, paddingTop: 6 },
  answer: { backgroundColor: c.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: c.line },
  sources: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.line, paddingTop: 8, gap: 4 },
  tray: { backgroundColor: c.surface, borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.line },
  composer: { width: '100%', maxWidth: 660, alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  attachment: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 4, paddingLeft: 10,
    borderRadius: 12, backgroundColor: c.primaryLight },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 7 },
  input: { minHeight: 48, maxHeight: 100, borderRadius: 18, textAlignVertical: 'center', backgroundColor: c.background },
  send: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: c.primary },
  sendMuted: { opacity: 0.48 },
});
