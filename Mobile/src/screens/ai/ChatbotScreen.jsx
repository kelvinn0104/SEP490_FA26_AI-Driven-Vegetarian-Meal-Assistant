import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  FlatList,
  Keyboard,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  History,
  MessageCircle,
  Plus,
  ScanLine,
  Send,
  X,
} from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../../api/services/chatService';
import { mealPlanService } from '../../api/services/mealPlanService';
import { healthProfileService } from '../../api/services/healthProfileService';
import { notificationService } from '../../api/services/notificationService';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Empty,
  Frame,
  GuestGate,
  Notice,
  Page,
  Pending,
  QueryState,
  RowLink,
  ui,
} from '../../components/ui/Kit';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/Header';
import { BowlChopsticksIcon } from '../../components/ui/Gauges';
import { Readable } from '../../components/ui/Readable';
import { c, font, r, sh } from '../../styles/theme';
import { chatContent, chatUnavailable, formatPostDate, listOf, number, today } from '../../styles/content.mjs';

const LIMIT = 2000;
const scanFooter = '\n\nNguyên liệu đã xác nhận từ ảnh: ';
const sourcesFooter = '\n\n**Nguồn tham khảo:**\n';

export function ChatbotScreen(props) {
  const signedIn = useAuthStore(state => !!state.token);
  if (!signedIn) {
    return (
      <Page title="Trợ lý bếp" tab>
        <GuestGate
          navigation={props.navigation}
          icon={BowlChopsticksIcon}
          title="Hỏi trợ lý bếp"
          detail="Đăng nhập để hỏi cách nấu và lưu cuộc trò chuyện."
        />
      </Page>
    );
  }
  return <Chat {...props} />;
}

function buildContextualPrompts({ diary, profile, notifications, latestPlan }) {
  const prompts = [];
  const alerts = [
    ...(diary?.alerts || []).map(a => a?.message || ''),
    ...listOf(notifications).filter(n => !n.isRead).map(n => n?.content || ''),
  ].join(' ');

  if (/b12/i.test(alerts)) {
    prompts.push({
      label: 'Món chay có vitamin B12',
      prompt:
        'Lượng Vitamin B12 những ngày qua của tôi chưa đạt mục tiêu. Hãy gợi ý 3 món chay Việt dễ nấu giúp bổ sung B12 và sắt hiệu quả.',
    });
  } else if (/sắt|iron/i.test(alerts)) {
    prompts.push({
      label: 'Bữa chay giàu sắt',
      prompt:
        'Gợi ý cách kết hợp rau xanh, các loại đậu và vitamin C trong bữa cơm chay Việt để hấp thu sắt tốt nhất.',
    });
  } else if (profile?.tdee > 0) {
    const kcalText = number(profile.tdee, 'kcal');
    const proText = profile?.targets?.proteinG > 0 ? ` và ${number(profile.targets.proteinG, 'g')} đạm` : '';
    prompts.push({
      label: `Ba bữa khoảng ${kcalText}`,
      prompt: `Dựa trên mục tiêu khoảng ${kcalText}${proText}/ngày của tôi, hãy gợi ý mâm cơm chay 3 bữa Sáng - Trưa - Tối thuần Việt, ít dầu mỡ.`,
    });
  } else {
    prompts.push({
      label: 'Phối món cho đủ đạm',
      prompt: 'Ăn chay hàng ngày cần kết hợp những nhóm thực phẩm nào trong bữa cơm Việt để đủ đạm, sắt và B12?',
    });
  }

  const allergyNames = (profile?.allergies || [])
    .map(a => a.nameVi || a.name)
    .filter(Boolean);

  if (allergyNames.length > 0) {
    const joined = allergyNames.slice(0, 2).join(', ');
    prompts.push({
      label: `Bữa tối tránh ${joined.toLowerCase()}`,
      prompt: `Tôi cần tránh ${joined}. Hãy gợi ý 3 món chay mặn đưa cơm cho bữa tối, dễ chuẩn bị trong 25 phút.`,
    });
  } else if (latestPlan?.title) {
    prompts.push({
      label: 'Đổi vị với đậu hũ và nấm',
      prompt: 'Gợi ý 2 cách kho hoặc áp chảo đậu hũ với nấm tươi sao cho săn ngon, thấm vị mà ít dầu.',
    });
  } else {
    prompts.push({
      label: 'Bữa tối chay nấu nhanh',
      prompt: 'Gợi ý mâm cơm tối chay nhanh gọn dưới 25 phút gồm 1 món mặn từ đậu hũ/nấm và 1 bát canh thanh mát.',
    });
  }

  prompts.push({
    label: 'Nấu nước dùng chay',
    prompt: 'Chia sẻ tỷ lệ củ quả nướng và nấm khô để nấu nồi nước dùng chay trong, ngọt thanh tự nhiên không cần bột ngọt.',
  });

  return prompts.slice(0, 3);
}

function Chat({ navigation, route }) {
  const client = useQueryClient();
  const focused = useIsFocused();
  const user = useAuthStore(state => state.user);
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

  const currentToday = today();
  const key = session ?? 'new';
  const draft = drafts[key] || '';
  const attachment = attachments[key];
  const content = chatContent(draft, attachment);
  const maxQuestion = Math.max(0, LIMIT - (attachment ? chatContent('x', attachment).length - 1 : 0));
  const canFit = content.length <= LIMIT;

  // Lightweight contextual queries so Assistant knows user's live kitchen & nutrition state
  const diaryQuery = useQuery({
    queryKey: ['diary', currentToday],
    queryFn: ({ signal }) => mealPlanService.daily(currentToday, signal),
    enabled: focused && !session && !history,
  });
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: ({ signal }) => healthProfileService.getProfile(signal),
    enabled: focused && !session && !history && user?.hasHealthProfile !== false,
  });
  const notifQuery = useQuery({
    queryKey: ['notifications', false, 1],
    queryFn: ({ signal }) => notificationService.getNotifications(1, false, signal),
    enabled: focused && !session && !history,
  });
  const plansQuery = useQuery({
    queryKey: ['plan-history', 1],
    queryFn: ({ signal }) => mealPlanService.getHistory(1, signal),
    enabled: focused && !session && !history,
  });

  const sessions = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: ({ signal }) => chatService.getSessions(signal),
    enabled: history && focused,
  });

  const transcript = useQuery({
    queryKey: ['chat', session],
    queryFn: ({ signal }) => chatService.getMessages(session, signal),
    enabled: !!session && focused && !history,
    staleTime: Infinity,
  });

  const messages = listOf(transcript.data).filter(
    message => message.sender === 'user' || !chatUnavailable(message.content)
  );

  const contextualPrompts = useMemo(
    () =>
      buildContextualPrompts({
        diary: diaryQuery.data,
        profile: profileQuery.data,
        notifications: notifQuery.data,
        latestPlan: listOf(plansQuery.data)[0],
      }),
    [diaryQuery.data, profileQuery.data, notifQuery.data, plansQuery.data]
  );

  useEffect(() => {
    if (!route.params?.scanAttachment) return;
    setAttachments(previous => ({ ...previous, [key]: route.params.scanAttachment }));
    setHistory(false);
    navigation.setParams({ scanAttachment: undefined });
  }, [route.params?.scanAttachment, key, navigation]);

  useEffect(() => {
    if (!history || !focused) return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      setHistory(false);
      return true;
    });
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
        const index = saved.findIndex(
          message =>
            message.sender === 'user' && message.content === text && !previousSend.before.has(message.id)
        );
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
        if (error.status && ![502, 504].includes(error.status)) unsettled.current.delete(id);
        throw error;
      }
    },
    onSuccess: ({ id, reply, saved }) => {
      if (reply) {
        client.setQueryData(['chat', id], previous => [
          ...listOf(previous).filter(
            message => message.id !== reply.userMessage.id && message.id !== reply.aiMessage.id
          ),
          reply.userMessage,
          { ...reply.aiMessage, citations: reply.citations },
        ]);
      } else {
        client.setQueryData(['chat', id], saved);
      }
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

  if (history) {
    return (
      <Page title="Sổ tay hỏi đáp" back={() => setHistory(false)} tab>
        <Button title="Mở cuộc trò chuyện mới" icon={Plus} onPress={startNew} />
        <QueryState query={sessions} skeletonCount={4}>
          {!listOf(sessions.data).length ? (
            <Empty
              title="Chưa có cuộc trò chuyện"
              detail="Mỗi câu hỏi về món chay và dinh dưỡng sẽ được lưu lại tại đây."
              icon={MessageCircle}
            />
          ) : (
            <View style={s.historyList}>
              {listOf(sessions.data).map((item, idx, arr) => (
                <RowLink
                  key={item.id}
                  border={idx < arr.length - 1}
                  label={
                    chatUnavailable(item.lastMessage)
                      ? 'Cuộc trò chuyện mới'
                      : item.lastMessage.replace(/[*_#]/g, '').trim()
                  }
                  detail={formatPostDate(item.createdAt)}
                  onPress={() => {
                    send.reset();
                    atBottom.current = true;
                    setSession(item.id);
                    setPlanId(item.planId);
                    setHistory(false);
                  }}
                />
              ))}
            </View>
          )}
        </QueryState>
      </Page>
    );
  }

  const openScan = () => {
    Keyboard.dismiss();
    navigation.navigate('VisionScan');
  };
  const openPlanner = () =>
    navigation.navigate('PlannerTab', { createRequestedAt: Date.now(), scanId: undefined });
  const change = text => setDrafts(previous => ({ ...previous, [key]: text }));
  const scrollToEnd = () => {
    if (atBottom.current) list.current?.scrollToEnd({ animated: false });
  };

  const last = messages.at(-1);
  const alreadyVisible = last?.sender === 'user' && last.content === send.variables?.text;
  const cannotSend =
    send.isPending || !draft.trim() || !canFit || (!!session && transcript.data === undefined);

  return (
    <Frame
      title="Trợ lý bếp"
      tab
      keyboard
      action={
        <View style={s.headerActions}>
          <IconButton
            label="Lịch sử trò chuyện"
            icon={History}
            tone="plain"
            disabled={send.isPending}
            onPress={() => {
              Keyboard.dismiss();
              setHistory(true);
            }}
          />
          <IconButton
            label="Cuộc trò chuyện mới"
            icon={Plus}
            tone="surface"
            disabled={send.isPending}
            onPress={startNew}
          />
        </View>
      }
    >
      <FlatList
        key={key}
        ref={list}
        data={messages}
        style={ui.fill}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.timeline}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={scrollToEnd}
        refreshControl={
          session ? (
            <RefreshControl
              refreshing={transcript.isRefetching}
              onRefresh={transcript.refetch}
              enabled={!send.isPending}
              colors={[c.terracotta]}
            />
          ) : undefined
        }
        onScroll={({ nativeEvent: { contentOffset, contentSize, layoutMeasurement } }) => {
          atBottom.current = contentSize.height - layoutMeasurement.height - contentOffset.y < 90;
        }}
        scrollEventThrottle={32}
        keyExtractor={item => String(item.id)}
        ListEmptyComponent={
          session && transcript.data === undefined ? (
            <QueryState query={transcript} skeletonCount={2} />
          ) : !send.isPending ? (
            <View style={s.editorialIntro}>
              <View style={s.motifBadge}>
                <BowlChopsticksIcon size={22} color={c.terracotta} strokeWidth={1.9} />
              </View>

              <Text accessibilityRole="header" style={ui.hero}>
                Nấu gì hôm nay?
              </Text>

              {/* Single Focal Surface: Personalized Contextual Prompts */}
              <View style={[ui.card, { paddingVertical: 6, gap: 0 }]}>
                {contextualPrompts.map((item, idx) => (
                  <Pressable
                    key={item.label}
                    accessibilityRole="button"
                    onPress={() => {
                      change(item.prompt);
                      input.current?.focus();
                    }}
                    style={({ pressed }) => [
                      s.promptRow,
                      idx < contextualPrompts.length - 1 && s.promptBorder,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <View style={ui.fill}>
                      <Text style={s.promptLabel}>{item.label}</Text>
                    </View>
                    <ArrowRight size={17} color={c.terracotta} strokeWidth={1.9} />
                  </Pressable>
                ))}
              </View>

              {/* Quiet Inline Kitchen Shortcuts (no 2x2 ChatGPT icon boxes) */}
              <View style={s.utilityRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={openScan}
                  style={({ pressed }) => [s.utilityLink, pressed && { opacity: 0.7 }]}
                >
                  <ScanLine size={16} color={c.inkSoft} strokeWidth={1.8} />
                  <Text style={s.utilityText}>Quét ảnh</Text>
                </Pressable>
                <View style={s.utilityDot} />
                <Pressable
                  accessibilityRole="button"
                  onPress={openPlanner}
                  style={({ pressed }) => [s.utilityLink, pressed && { opacity: 0.7 }]}
                >
                  <CalendarDays size={16} color={c.inkSoft} strokeWidth={1.8} />
                  <Text style={s.utilityText}>Lên thực đơn</Text>
                </Pressable>
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => <Message item={item} navigation={navigation} />}
        ListFooterComponent={
          send.isPending && !alreadyVisible ? (
            <View style={{ gap: 10 }}>
              <Message item={{ sender: 'user', content: send.variables?.text }} navigation={navigation} />
              <View style={s.thinkingBubble}>
                <Pending label="Trợ lý đang tìm món…" />
              </View>
            </View>
          ) : send.isPending ? (
            <View style={s.thinkingBubble}>
              <Pending label="Đang kiểm tra phản hồi…" />
            </View>
          ) : null
        }
      />

      <View style={s.tray}>
        <View style={s.composer}>
          <Notice error>
            {send.error?.message || (!canFit ? 'Câu hỏi hơi dài, hãy rút gọn để gửi kèm nguyên liệu.' : '')}
          </Notice>

          {planId != null ? (
            <View style={s.contextChip}>
              <CalendarDays size={15} color={c.ink} strokeWidth={1.8} />
              <Text style={[ui.small, ui.fill, { color: c.ink }]}>
                Đang dùng thực đơn này
              </Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Bỏ thực đơn đính kèm" hitSlop={8} onPress={() => setPlanId(null)}>
                <X size={15} color={c.muted} />
              </Pressable>
            </View>
          ) : null}

          {attachment ? (
            <View style={s.attachment}>
              <ScanLine size={17} color={c.terracotta} strokeWidth={1.9} />
              <View style={ui.fill}>
                <Text style={ui.label}>Nguyên liệu từ ảnh quét</Text>
                <Text style={ui.small} numberOfLines={1}>
                  {attachment.ingredients.join(', ')}
                </Text>
              </View>
              <IconButton
                label="Bỏ nguyên liệu đính kèm"
                icon={X}
                size={34}
                disabled={send.isPending}
                onPress={() => setAttachments(previous => ({ ...previous, [key]: undefined }))}
              />
            </View>
          ) : null}

          <View style={s.inputRow}>
            <IconButton
              label="Quét nguyên liệu bằng ảnh"
              icon={ScanLine}
              size={44}
              tone="surface"
              disabled={send.isPending}
              onPress={openScan}
            />
            <View style={s.inputShell}>
              <TextInput
                ref={input}
                accessibilityLabel="Tin nhắn gửi trợ lý"
                placeholder="Hỏi về món chay…"
                placeholderTextColor={c.subtle}
                selectionColor={c.terracotta}
                maxLength={maxQuestion}
                editable={!send.isPending}
                multiline
                value={draft}
                onChangeText={change}
                style={s.input}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Gửi tin nhắn"
              accessibilityState={{ busy: send.isPending, disabled: cannotSend }}
              disabled={cannotSend}
              onPress={submit}
              style={({ pressed }) => [s.send, (pressed || cannotSend) && s.sendMuted]}
            >
              <Send size={18} color="#FFFEFA" strokeWidth={2} />
            </Pressable>
          </View>
        </View>
      </View>
    </Frame>
  );
}

function Message({ item, navigation }) {
  const own = item.sender === 'user';
  const cites = item.citations || [];
  const [text, ingredients] = own ? String(item.content ?? '').split(scanFooter, 2) : [item.content];

  if (own) {
    return (
      <View style={[s.bubble, s.own]}>
        <Text style={s.ownText}>{text}</Text>
        {ingredients ? (
          <View style={s.ownScanTag}>
            <ScanLine size={13} color={c.peach} />
            <Text style={s.ownAttachment}>{ingredients}</Text>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[s.bubble, s.answer]}>
      <View style={s.botHeader}>
        <View style={s.botAvatar}>
          <BowlChopsticksIcon color={c.terracotta} size={15} strokeWidth={1.9} />
        </View>
        <Text style={s.botName}>Sổ tay bếp VeggieAI</Text>
      </View>
      <Readable content={cites.length ? String(text).split(sourcesFooter, 1)[0] : text} />
      {cites.length > 0 ? (
        <View style={s.sources}>
          <Text style={ui.eyebrow}>Công thức liên quan</Text>
          {cites.map(source =>
            source.type === 'recipe' ? (
              <Pressable
                key={source.index}
                accessibilityRole="button"
                onPress={() => navigation.navigate('RecipeDetail', { recipeId: source.id })}
                style={({ pressed }) => [s.citeRow, pressed && { opacity: 0.72 }]}
              >
                <BookOpen size={15} color={c.terracotta} strokeWidth={1.9} />
                <Text style={[ui.label, ui.fill]} numberOfLines={1}>
                  {source.title}
                </Text>
                <ArrowUpRight size={16} color={c.terracotta} />
              </Pressable>
            ) : (
              <Text key={source.index} style={ui.small}>
                • {source.title}
              </Text>
            )
          )}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  headerActions: { flexDirection: 'row', gap: 6 },
  timeline: { ...ui.content, flexGrow: 1, paddingBottom: 16, gap: 14 },
  editorialIntro: {
    gap: 12,
    paddingTop: 4,
  },
  motifBadge: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.primaryLight,
    borderRadius: r.lg,
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    paddingVertical: 10,
  },
  promptBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.line,
  },
  promptLabel: {
    fontFamily: font.medium,
    fontSize: 14,
    lineHeight: 22,
    color: c.ink,
    includeFontPadding: false,
  },
  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 4,
  },
  utilityLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
  },
  utilityText: {
    fontFamily: font.medium,
    fontSize: 13,
    color: c.inkSoft,
    includeFontPadding: false,
  },
  utilityDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: c.lineStrong,
  },
  historyList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
  },
  bubble: { padding: 15, gap: 9, borderRadius: r.lg },
  own: {
    maxWidth: '86%',
    alignSelf: 'flex-end',
    backgroundColor: c.ink,
    borderBottomRightRadius: 4,
  },
  ownText: {
    fontFamily: font.regular,
    color: '#FFFEFA',
    fontSize: 15,
    lineHeight: 22,
    includeFontPadding: false,
  },
  ownScanTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,254,250,0.22)',
    paddingTop: 7,
  },
  ownAttachment: {
    flex: 1,
    fontFamily: font.medium,
    color: c.peach,
    fontSize: 12.5,
    lineHeight: 18,
    includeFontPadding: false,
  },
  answer: {
    backgroundColor: c.surfaceElevated,
    borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
    ...sh.card,
  },
  botHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: c.terracottaSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botName: {
    fontFamily: font.serifBold,
    fontSize: 14,
    color: c.ink,
    includeFontPadding: false,
  },
  sources: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
    paddingTop: 10,
    gap: 6,
  },
  citeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
  },
  thinkingBubble: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    borderRadius: r.lg,
    backgroundColor: c.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
  },
  tray: {
    backgroundColor: c.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: c.lineStrong,
  },
  composer: {
    width: '100%',
    maxWidth: 660,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 8,
  },
  contextChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: r.pill,
    backgroundColor: c.surfaceMuted,
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: r.md,
    backgroundColor: c.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.lineStrong,
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  inputShell: {
    flex: 1,
    minHeight: 46,
    maxHeight: 112,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: c.lineStrong,
    backgroundColor: c.surfaceElevated,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  input: {
    fontFamily: font.regular,
    fontSize: 15,
    color: c.ink,
    paddingVertical: 9,
    maxHeight: 106,
    includeFontPadding: false,
    outlineStyle: 'none',
  },
  send: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.terracotta,
  },
  sendMuted: { opacity: 0.38 },
});
