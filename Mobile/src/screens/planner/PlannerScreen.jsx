import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl, BackHandler, Keyboard } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Check, MessageCircle, ShoppingBasket, Utensils } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { mealPlanService as api } from '../../api/services/mealPlanService';
import { healthProfileService } from '../../api/services/healthProfileService';
import { FoodImage } from '../../components/recipe/RecipeCard';
import { Button } from '../../components/ui/Button';
import { Page, Title, Field, Chip, GuestGate, QueryState, Empty, Notice, Pending, RowLink, ui } from '../../components/ui/Kit';
import { c } from '../../styles/theme';
import { addDays, isDemo, listOf, loggedMealIds, mealNames, number, planNames, shortDate, today, validDate } from '../../styles/content.mjs';

const defaultMeals = ['breakfast', 'lunch', 'dinner'];
const dayFormat = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', timeZone: 'Asia/Ho_Chi_Minh' });
const shortDayFormat = new Intl.DateTimeFormat('vi-VN', { weekday: 'short', timeZone: 'Asia/Ho_Chi_Minh' });

async function loadPlan(id, signal) {
  if (id) {
    try { return await api.getPlan(id, signal); }
    catch (error) { if (error.status !== 404) throw error; }
  }
  const active = await api.getCurrentPlan(signal);
  if (active) return active;
  const latest = listOf(await api.getHistory(1, signal, 'draft'))[0];
  return latest ? api.getPlan(latest.id, signal) : null;
}

export function PlannerScreen(props) {
  const user = useAuthStore(state => state.user);
  if (!user) return <Page title="Thực đơn" tab>
    <GuestGate navigation={props.navigation} icon={CalendarDays} title="Lên lịch bữa ăn"
      detail="Đăng nhập để lập thực đơn theo nhu cầu và lưu các bữa đã ăn." />
  </Page>;
  return <Planner {...props} user={user} />;
}

function Planner({ user, route, navigation }) {
  const scanId = route.params?.scanId;
  const client = useQueryClient();
  const storageKey = 'veggie_plan_' + String(user.id ?? user.email).replace(/[^\w.-]/g, '_');
  const [selection, setSelection] = useState(undefined);
  const [screen, setScreen] = useState('plan');
  const [historyPage, setHistoryPage] = useState(1);
  const [days, setDays] = useState('7');
  const [startMode, setStartMode] = useState('tomorrow');
  const [customStart, setCustomStart] = useState(() => addDays(today(), 1));
  const [customDays, setCustomDays] = useState(false);
  const [mealTypes, setMealTypes] = useState(defaultMeals);
  const [note, setNote] = useState('');
  const [dayDate, setDayDate] = useState(today);
  const [generation, setGeneration] = useState(null);
  const [showWarnings, setShowWarnings] = useState(false);
  const [feedback, setFeedback] = useState('');
  const pending = useRef(false);
  const start = startMode === 'custom' ? customStart : addDays(today(), startMode === 'tomorrow' ? 1 : 0);
  const dayCount = Number(days);
  const dateOk = validDate(start);
  const daysOk = /^\d+$/.test(days) && dayCount >= 1 && dayCount <= 60;
  const end = dateOk && daysOk ? addDays(start, dayCount - 1) : '';
  const rangeOk = validDate(end);
  const profile = useQuery({ queryKey: ['profile'], queryFn: ({ signal }) => healthProfileService.getProfile(signal), enabled: screen === 'create' });
  useEffect(() => {
    let live = true;
    SecureStore.getItemAsync(storageKey).catch(() => null).then(id => {
      if (live) setSelection(previous => previous === undefined ? id || null : previous);
    });
    return () => { live = false; };
  }, [storageKey]);
  useEffect(() => {
    if (route.params?.createRequestedAt) setScreen('create');
  }, [route.params?.createRequestedAt]);

  const query = useQuery({ queryKey: ['plan', selection], queryFn: ({ signal }) => loadPlan(selection, signal), enabled: selection !== undefined });
  const plan = query.data;
  const planDays = plan?.days || [];
  const selectedIndex = Math.max(planDays.findIndex(day => day.date === dayDate), 0);
  const day = planDays[selectedIndex];
  const history = useQuery({ queryKey: ['plan-history', historyPage], queryFn: ({ signal }) => api.getHistory(historyPage, signal), enabled: screen === 'history' });
  const canLogDay = !!day && day.date <= today();
  const diary = useQuery({ queryKey: ['diary', day?.date], queryFn: ({ signal }) => api.daily(day.date, signal), enabled: screen === 'plan' && canLogDay });
  const logged = loggedMealIds(diary.data, day?.date);
  const meals = (day?.meals || []).filter(meal => !isDemo({ title: meal.recipeTitle }));
  const eaten = meals.filter(meal => logged.has(String(meal.id))).length;
  const [shopping, setShopping] = useState(null);

  function selectPlan(next) {
    if (!next?.id || !Array.isArray(next.days)) throw new Error('Chưa nhận được thực đơn hợp lệ.');
    const id = String(next.id);
    client.setQueryData(['plan', id], next);
    setSelection(id);
    SecureStore.setItemAsync(storageKey, id).catch(() => {});
    setDayDate(previous => next.days.some(item => item.date === previous) ? previous : next.days[0]?.date);
  }

  function changeScreen(next) {
    mutation.reset();
    setFeedback('');
    setScreen(next);
  }

  const mutation = useMutation({
    mutationFn: async ({ type, id, item }) => {
      if (type === 'generate') return api.generatePlan({ startDate: start, days: dayCount, note: note.trim() || null,
        mealTypes, ...(scanId && { scanId }) });
      if (type === 'open') return api.getPlan(id);
      if (type === 'activate') return api.activate(plan.id);
      if (type === 'swap') {
        const result = await api.swap(plan.id, item.id);
        return result?.plan || api.getPlan(plan.id);
      }
      if (type === 'log') return api.log(item.id);
      if (type === 'shop') return api.shopping(plan.id);
      return api.buy(plan.id, item.id, !item.isBought);
    },
    onSuccess: async (data, { type, item }) => {
      if (type === 'generate') {
        selectPlan(data?.plan);
        setGeneration({ id: data.plan.id, source: data.generatedBy, warnings: data.validationWarnings || [] });
        setShowWarnings(false);
        setScreen('plan');
        navigation.setParams({ scanId: undefined, createRequestedAt: undefined });
      } else if (type === 'open' || type === 'activate' || type === 'swap') {
        selectPlan(data);
        if (type === 'open') {
          setScreen('plan');
        } else {
          setFeedback(type === 'activate' ? 'Thực đơn đã được kích hoạt.' : 'Đã đổi món.');
        }
      } else if (type === 'log') {
        await client.invalidateQueries({ queryKey: ['diary', day?.date] });
        setFeedback('Đã ghi nhận bữa ăn.');
      } else if (type === 'shop') {
        if (!Array.isArray(data?.items)) throw new Error('Chưa nhận được danh sách đi chợ.');
        setShopping(data);
        setScreen('shop');
      } else {
        if (!data || data.id !== item.id) throw new Error('Chưa xác nhận được món đã mua.');
        setShopping(previous => ({ ...previous, items: previous.items.map(entry => entry.id === item.id ? data : entry) }));
      }
      if (['generate', 'activate', 'swap'].includes(type)) client.invalidateQueries({ queryKey: ['plan-history'] });
    },
    onSettled: (_data, error, variables) => {
      pending.current = false;
      if (error && variables.type === 'generate') client.invalidateQueries({ queryKey: ['plan-history'] });
    },
  });
  const run = (type, extra = {}) => {
    if (pending.current) return;
    pending.current = true;
    Keyboard.dismiss();
    setFeedback('');
    mutation.mutate({ type, ...extra });
  };
  const busy = mutation.isPending;
  useFocusEffect(useCallback(() => {
    if (screen === 'plan') return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!busy) {
        setScreen('plan');
        navigation.setParams({ scanId: undefined, createRequestedAt: undefined });
      }
      return true;
    });
    return () => listener.remove();
  }, [screen, busy, navigation]));
  const startNew = () => {
    navigation.setParams({ scanId: undefined, createRequestedAt: undefined });
    changeScreen('create');
  };
  const openRecipe = recipeId => navigation.navigate('RecipeDetail', { recipeId });
  const details = generation?.id === plan?.id ? generation : null;
  const generationPending = busy && mutation.variables?.type === 'generate';
  const checkHistory = mutation.variables?.type === 'generate' && mutation.error && (!mutation.error.status || mutation.error.status >= 500);

  return <Page title="Thực đơn" tab keyboard={screen === 'create'} refreshControl={screen === 'plan' ?
    <RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} colors={[c.primary]} /> : undefined}>
    {screen !== 'plan' && <Title title={{ create: 'Lên thực đơn', history: 'Thực đơn đã tạo', shop: 'Đi chợ' }[screen]} />}
    <Notice error>{mutation.error?.message}</Notice>
    {checkHistory && <Button title="Kiểm tra bản nháp trong lịch sử" variant="outline" onPress={() => changeScreen('history')} />}
    <Notice>{feedback}</Notice>
    {busy && !generationPending && <Pending label={{ swap: 'Đang tìm món thay thế…', shop: 'Đang tải danh sách đi chợ…' }[mutation.variables?.type] || 'Đang cập nhật…'} />}

    {screen === 'create' && <>
      {generationPending && <View style={s.waiting}>
        <Pending label={'Đang tạo thực đơn ' + days + ' ngày…'} />
        <Text style={ui.small}>Máy chủ đang chọn món và tính khẩu phần. Bạn có thể chuyển tab trong lúc chờ.</Text>
      </View>}
      <QueryState query={profile}>
        <RowLink label={profile.data ? 'Hồ sơ sức khỏe' : 'Thêm hồ sơ sức khỏe'} icon={CalendarDays}
          detail={profile.data ? 'Dùng mục tiêu và dị ứng đã lưu' : 'Cần hồ sơ trước khi tạo thực đơn'}
          onPress={() => { if (!busy) navigation.navigate('HealthProfile'); }} />
      </QueryState>
      {!!scanId && <Notice>Ưu tiên nguyên liệu từ lượt quét đã xác nhận.</Notice>}
      <View style={ui.card}>
        <Text style={ui.h2}>Lịch ăn</Text>
        <Text style={ui.label}>Bắt đầu</Text>
        <View style={ui.row}>
          {[['today', 'Hôm nay'], ['tomorrow', 'Ngày mai'], ['custom', 'Chọn ngày']].map(([value, label]) =>
            <Chip key={value} label={label} selected={value === startMode} disabled={busy} onPress={() => setStartMode(value)} />)}
        </View>
        {startMode === 'custom' && <Field label="Ngày bắt đầu (năm-tháng-ngày)" value={customStart} onChangeText={setCustomStart}
          autoCapitalize="none" maxLength={10} editable={!busy} />}
        <Text style={ui.label}>Thời lượng</Text>
        <View style={ui.row}>
          {[7, 3, 14].map(value => <Chip key={value} label={value + ' ngày'} selected={!customDays && String(value) === days}
            disabled={busy} onPress={() => { setCustomDays(false); setDays(String(value)); }} />)}
          <Chip label="Tùy chọn" selected={customDays} disabled={busy} onPress={() => setCustomDays(true)} />
        </View>
        {customDays && <Field label="Số ngày (1–60)" value={days} onChangeText={setDays} inputMode="numeric" maxLength={2} editable={!busy} />}
        {rangeOk && <Text style={ui.body}>{shortDate(start)} – {shortDate(end)}</Text>}
        {!dateOk && <Notice error>Nhập ngày theo định dạng YYYY-MM-DD.</Notice>}
        {!daysOk && <Notice error>Chọn từ 1 đến 60 ngày.</Notice>}
        {dateOk && daysOk && !rangeOk && <Notice error>Khoảng ngày vượt giới hạn lịch.</Notice>}
      </View>
      <View style={ui.card}>
        <Text style={ui.h2}>Bữa ăn</Text>
        <View style={ui.row}>
          {Object.entries(mealNames).map(([value, label]) => <Chip key={value} label={label} selected={mealTypes.includes(value)}
            disabled={busy || (mealTypes.length === 1 && mealTypes.includes(value))}
            onPress={() => setMealTypes(previous => previous.includes(value) ? previous.filter(meal => meal !== value) : [...previous, value])} />)}
        </View>
        <Field label="Lưu ý cho thực đơn" placeholder="Ví dụ: món Việt, ít cay" value={note} onChangeText={setNote} multiline maxLength={500} editable={!busy} />
      </View>
      <Button title="Tạo thực đơn" loading={generationPending} disabled={busy || !rangeOk || !profile.data || profile.isError}
        onPress={() => run('generate')} />
      <Button title="Quay lại thực đơn" variant="outline" disabled={busy}
        onPress={() => { navigation.setParams({ scanId: undefined, createRequestedAt: undefined }); changeScreen('plan'); }} />
    </>}

    {screen === 'history' && <>
      <Button title="Về thực đơn" variant="outline" disabled={busy} onPress={() => changeScreen('plan')} />
      <QueryState query={history}>
        {!listOf(history.data).length && <Empty title="Chưa tạo thực đơn" icon={CalendarDays} />}
        {listOf(history.data).map(entry => <View key={entry.id} style={ui.card}>
          <RowLink label={shortDate(entry.startDate) + ' – ' + shortDate(entry.endDate)} detail={planNames[entry.status]} icon={CalendarDays}
            onPress={() => run('open', { id: entry.id })} />
        </View>)}
        <View style={ui.row}>
          <Button title="Trang trước" variant="outline" disabled={historyPage <= 1 || busy} onPress={() => setHistoryPage(historyPage - 1)} />
          <Button title="Trang sau" variant="outline" disabled={historyPage >= (history.data?.totalPages || 1) || busy} onPress={() => setHistoryPage(historyPage + 1)} />
        </View>
      </QueryState>
    </>}

    {screen === 'shop' && shopping && <>
      <Button title="Về thực đơn" variant="outline" disabled={busy} onPress={() => changeScreen('plan')} />
      <View style={ui.card}>
        <Text style={ui.h2}>{shopping.items.filter(item => item.isBought).length}/{shopping.items.length} đã mua</Text>
        {!shopping.items.length && <Text style={ui.body}>Chưa có nguyên liệu trong danh sách.</Text>}
        {shopping.items.map(item => <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: !!item.isBought, disabled: busy }}
          key={item.id} disabled={busy} style={s.shopRow} onPress={() => run('buy', { item })}>
          <View style={[s.check, item.isBought && { backgroundColor: c.lime }]}>{item.isBought && <Check size={15} color={c.primary} />}</View>
          <Text style={[ui.label, ui.fill]}>{item.ingredientName}</Text><Text style={ui.body}>{number(item.quantityG, 'g')}</Text>
        </Pressable>)}
      </View>
    </>}

    {screen === 'plan' && <>
      <View style={ui.row}>
        <Button title="Tạo mới" icon={CalendarDays} style={ui.fill} disabled={busy} onPress={startNew} />
        <Button title="Lịch sử" variant="outline" style={ui.fill} disabled={busy} onPress={() => changeScreen('history')} />
      </View>
      <QueryState query={query}>
        {!day ? <Empty title="Chưa có thực đơn" detail="Tạo lịch ăn tuần từ mục tiêu và dị ứng trong hồ sơ." icon={CalendarDays} /> : <>
          <View style={s.planHero}>
            <Text style={s.heroMeta}>{planNames[plan.status] || 'Thực đơn'} · {planDays.length} ngày</Text>
            <Text accessibilityRole="header" style={s.heroDate}>{shortDate(plan.startDate)} – {shortDate(plan.endDate)}</Text>
            {details?.source?.includes('rule-based') && <Text style={s.heroMeta}>
              {details.source.startsWith('ai:') ? 'AI hỗ trợ, hệ thống bổ sung món' : 'Hệ thống chọn món theo hồ sơ'}
            </Text>}
          </View>
          <View style={ui.group}>
            {plan.status !== 'active' && <Button title={plan.status === 'draft' ? 'Dùng thực đơn này' : 'Dùng lại thực đơn'} disabled={busy} onPress={() => run('activate')} />}
            <View style={ui.row}>
              <Button title="Danh sách đi chợ" variant="outline" style={ui.fill} icon={ShoppingBasket} disabled={busy} onPress={() => run('shop')} />
              <Button title="Hỏi về thực đơn" variant="outline" style={ui.fill} icon={MessageCircle} disabled={busy}
                onPress={() => navigation.navigate('ChatTab', { planId: plan.id })} />
            </View>
            {!!details?.warnings.length && <>
              <RowLink label={showWarnings ? 'Ẩn lưu ý thực đơn' : 'Xem lưu ý thực đơn'} detail={details.warnings.length + ' lưu ý từ máy chủ'}
                onPress={() => setShowWarnings(previous => !previous)} />
              {showWarnings && <Notice>{details.warnings.join('\n')}</Notice>}
            </>}
          </View>
          <PlanDays days={planDays} day={day} index={selectedIndex} disabled={busy} select={setDayDate} />
          <View style={[ui.card, s.summary]}>
            <View style={ui.between}>
              <View style={ui.fill}>
                <Text style={ui.label}>Dự kiến trong ngày</Text>
                <Text style={s.energy}>{number(day.total?.kcal, 'kcal')}</Text>
                {day.kcalTarget > 0 && <Text style={ui.small}>Mục tiêu {number(day.kcalTarget, 'kcal')}</Text>}
              </View>
              <Utensils size={27} color={c.primary} strokeWidth={1.5} />
            </View>
            <View style={ui.row}>{[['Đạm', 'proteinG'], ['Tinh bột', 'carbG'], ['Béo', 'fatG']].map(([label, field]) => <View key={field} style={[ui.fill, s.metric]}>
              <Text style={ui.small}>{label}</Text><Text style={ui.label}>{number(day.total?.[field], 'g')}</Text>
            </View>)}</View>
            {canLogDay && <QueryState query={diary}>
              {diary.data?.date === day.date && <>
                <Text style={ui.label}>{eaten}/{meals.length} bữa đã ghi · {number(diary.data?.consumed?.kcal, 'kcal')}</Text>
                {!!meals.length && <View accessible accessibilityRole="progressbar" accessibilityLabel="Bữa đã ghi nhận"
                  accessibilityValue={{ min: 0, max: meals.length, now: eaten }} style={s.track}>
                  {meals.map(meal => <View key={meal.id} style={[s.segment, logged.has(String(meal.id)) && s.progress]} />)}
                </View>}
              </>}
            </QueryState>}
            {canLogDay && <Button title="Mở nhật ký ngày này" variant="outline"
              onPress={() => navigation.navigate('Nutrition', { date: day.date })} />}
          </View>
          {!meals.length && <Empty title="Chưa có món cho ngày này" icon={Utensils} />}
          {meals.map(meal => {
            const done = logged.has(String(meal.id));
            return <View key={meal.id} style={ui.card}>
              <Pressable accessibilityRole="button" accessibilityLabel={'Xem ' + meal.recipeTitle} onPress={() => openRecipe(meal.recipeId)} style={s.mealTop}>
                <FoodImage uri={meal.recipeImageUrl} style={s.thumb} />
                <View style={ui.fill}>
                  <Text style={ui.eyebrow}>{mealNames[meal.mealType] || 'Bữa ăn'}</Text>
                  <Text style={ui.label}>{meal.recipeTitle}</Text>
                  <Text style={ui.small}>{number(meal.servings, 'phần')} · {number(meal.nutrition?.kcal, 'kcal')}</Text>
                </View>
              </Pressable>
              <View style={ui.row}>
                <Button title="Đổi món" variant="outline" style={ui.fill}
                  disabled={busy || done || (canLogDay && (diary.data?.date !== day.date || diary.isError))}
                  onPress={() => run('swap', { item: meal })} />
                <Button title={done ? 'Đã ghi' : 'Đã ăn'} icon={Check} variant="secondary" style={ui.fill}
                  disabled={busy || done || diary.data?.date !== day.date || diary.isError || day.date > today() || plan.status !== 'active'} onPress={() => run('log', { item: meal })} />
              </View>
            </View>;
          })}
        </>}
      </QueryState>
    </>}
  </Page>;
}

function PlanDays({ days, day, index, disabled, select }) {
  const scroll = useRef(null);
  const revealSelection = useCallback(() => {
    scroll.current?.scrollTo({ x: Math.max(0, (index - 2) * 50), animated: false });
  }, [index]);
  useEffect(revealSelection, [revealSelection]);
  return <View style={ui.group}>
    <View style={ui.between}>
      <Text style={[ui.label, ui.fill]}>{dayFormat.format(new Date(day.date + 'T12:00:00Z'))} · {shortDate(day.date)}</Text>
      <Text style={ui.small}>Ngày {index + 1}/{days.length}</Text>
    </View>
    <ScrollView ref={scroll} onContentSizeChange={revealSelection} horizontal contentContainerStyle={s.dayStrip}>
      {days.map(entry => {
        const selected = entry.date === day.date;
        return <Pressable key={entry.date} accessibilityRole="button" accessibilityLabel={'Ngày ' + shortDate(entry.date)}
          accessibilityState={{ selected, disabled }} disabled={disabled} style={[s.day, selected && s.daySelected]}
          onPress={() => select(entry.date)}>
          <Text style={[ui.small, selected && s.dayTextSelected]}>{shortDayFormat.format(new Date(entry.date + 'T12:00:00Z'))}</Text>
          <Text style={[ui.label, selected && s.dayTextSelected]}>{entry.date.slice(-2)}</Text>
        </Pressable>;
      })}
    </ScrollView>
  </View>;
}

const s = StyleSheet.create({
  planHero: { backgroundColor: c.primaryDark, borderRadius: 20, padding: 18, gap: 4 },
  heroDate: { fontFamily: 'serif', color: c.surface, fontSize: 34, fontVariant: ['tabular-nums'] },
  heroMeta: { color: c.primaryLight, fontSize: 14, lineHeight: 20 },
  dayStrip: { gap: 2, paddingBottom: 4 },
  day: { width: 48, minHeight: 55, justifyContent: 'center', alignItems: 'center', gap: 2,
    backgroundColor: c.surface, borderRadius: 12, borderWidth: 1, borderColor: c.line },
  daySelected: { backgroundColor: c.primary, borderColor: c.primary },
  dayTextSelected: { color: c.surface },
  waiting: { padding: 12, gap: 4, borderRadius: 16, backgroundColor: c.primaryLight },
  summary: { overflow: 'hidden', backgroundColor: c.stone },
  energy: { fontFamily: 'serif', fontSize: 32, color: c.ink, fontVariant: ['tabular-nums'] },
  metric: { padding: 8, backgroundColor: c.surface, borderRadius: 10 },
  track: { flexDirection: 'row', gap: 4, height: 7 },
  segment: { flex: 1, backgroundColor: c.line, borderRadius: 8 },
  progress: { backgroundColor: c.primary },
  mealTop: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 },
  thumb: { width: 58, height: 58, borderRadius: 10 },
  shopRow: { ...ui.between, minHeight: 50, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.line },
  check: { width: 25, height: 25, borderWidth: 1, borderColor: c.line, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
