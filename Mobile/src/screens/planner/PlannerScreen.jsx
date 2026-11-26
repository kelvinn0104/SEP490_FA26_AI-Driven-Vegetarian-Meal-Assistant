import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl, BackHandler } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Check, ChevronLeft, ChevronRight, ShoppingBasket, Utensils } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { mealPlanService as api } from '../../api/services/mealPlanService';
import { healthProfileService } from '../../api/services/healthProfileService';
import { FoodImage } from '../../components/recipe/RecipeCard';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/Header';
import { Page, Title, Field, Chip, GuestGate, QueryState, Empty, Notice, Pending, RowLink, ui } from '../../components/ui/Kit';
import { c } from '../../styles/theme';
import { isDemo, listOf, loggedMealIds, mealNames, number, planNames, shortDate, today, validDate } from '../../styles/content.mjs';

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
  const [start, setStart] = useState(today);
  const [note, setNote] = useState('');
  const [dayDate, setDayDate] = useState(today);
  const [warnings, setWarnings] = useState([]);
  const [feedback, setFeedback] = useState('');
  useEffect(() => {
    let live = true;
    SecureStore.getItemAsync(storageKey).catch(() => null).then(id => { if (live) setSelection(id || null); });
    return () => { live = false; };
  }, [storageKey]);
  useEffect(() => {
    if (scanId) setScreen('create');
  }, [scanId, route.params?.scanRequestedAt]);

  const query = useQuery({ queryKey: ['plan', selection], queryFn: ({ signal }) => loadPlan(selection, signal), enabled: selection !== undefined });
  const plan = query.data;
  const planDays = plan?.days || [];
  const selectedIndex = Math.max(planDays.findIndex(day => day.date === dayDate), 0);
  const day = planDays[selectedIndex];
  const history = useQuery({ queryKey: ['plan-history', historyPage], queryFn: ({ signal }) => api.getHistory(historyPage, signal), enabled: screen === 'history' });
  const diary = useQuery({ queryKey: ['diary', day?.date], queryFn: ({ signal }) => api.daily(day.date, signal), enabled: screen === 'plan' && !!day });
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
      if (type === 'generate') {
        if (!validDate(start)) throw new Error('Nhập ngày bắt đầu theo dạng năm-tháng-ngày, ví dụ 2026-11-27.');
        if (!/^\d+$/.test(days) || Number(days) < 1 || Number(days) > 60) throw new Error('Chọn từ 1 đến 60 ngày.');
        if (!(await healthProfileService.getProfile())) throw new Error('Thiết lập hồ sơ sức khỏe trước khi tạo thực đơn.');
        return api.generatePlan({ startDate: start, days: Number(days), note: note.trim() || null,
          mealTypes: ['breakfast', 'lunch', 'dinner'], ...(scanId && { scanId }) });
      }
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
        setWarnings(data.validationWarnings || []);
        setScreen('plan');
        navigation.setParams({ scanId: undefined, scanRequestedAt: undefined });
        setFeedback('Đã tạo bản nháp. Xem các bữa rồi chọn dùng thực đơn.');
      } else if (type === 'open' || type === 'activate' || type === 'swap') {
        selectPlan(data);
        if (type === 'open') {
          setWarnings([]);
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
  });
  const run = (type, extra = {}) => {
    if (mutation.isPending) return;
    setFeedback('');
    mutation.mutate({ type, ...extra });
  };
  const busy = mutation.isPending;
  useFocusEffect(useCallback(() => {
    if (screen === 'plan') return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!busy) {
        setScreen('plan');
        navigation.setParams({ scanId: undefined, scanRequestedAt: undefined });
      }
      return true;
    });
    return () => listener.remove();
  }, [screen, busy, navigation]));
  const startNew = () => {
    navigation.setParams({ scanId: undefined, scanRequestedAt: undefined });
    changeScreen('create');
  };
  const openRecipe = recipeId => navigation.navigate('RecipeDetail', { recipeId });

  return <Page title="Thực đơn" tab keyboard={screen === 'create'} refreshControl={screen === 'plan' ?
    <RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} colors={[c.primary]} /> : undefined}>
    <Title title={{ plan: 'Lịch bữa ăn', create: 'Tạo thực đơn', history: 'Thực đơn đã tạo', shop: 'Đi chợ' }[screen]} />
    <Notice error>{mutation.error?.message}</Notice>
    <Notice>{feedback}</Notice>
    {busy && <Pending label={{ generate: 'Đang tạo thực đơn…', swap: 'Đang tìm món thay thế…', shop: 'Đang tải danh sách đi chợ…' }[mutation.variables?.type] || 'Đang cập nhật…'} />}

    {screen === 'create' && <View style={ui.card}>
      {scanId && <Notice>Ưu tiên nguyên liệu từ lượt quét đã xác nhận.</Notice>}
      <Field label="Ngày bắt đầu (năm-tháng-ngày)" value={start} onChangeText={setStart} autoCapitalize="none" maxLength={10} editable={!busy} />
      <Field label="Số ngày" value={days} onChangeText={setDays} inputMode="numeric" maxLength={2} editable={!busy} />
      <View style={ui.row}>{[3, 7, 14, 30].map(value => <Chip key={value} label={value + ' ngày'} selected={String(value) === days} disabled={busy} onPress={() => setDays(String(value))} />)}</View>
      <Field label="Món muốn ăn hoặc lưu ý" placeholder="Ví dụ: món Việt, ít cay" value={note} onChangeText={setNote} multiline maxLength={500} editable={!busy} />
      <Text style={ui.small}>Mục tiêu và dị ứng lấy từ hồ sơ đã lưu.</Text>
      <Button title="Tạo thực đơn" loading={busy} onPress={() => run('generate')} />
      <Button title="Xem hồ sơ sức khỏe" variant="outline" disabled={busy} onPress={() => navigation.navigate('HealthProfile')} />
      <Button title="Quay lại thực đơn" variant="outline" disabled={busy} onPress={() => { navigation.setParams({ scanId: undefined }); changeScreen('plan'); }} />
    </View>}

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
        <Button title="Tạo mới" style={ui.fill} disabled={busy} onPress={startNew} />
        <Button title="Lịch sử" variant="outline" style={ui.fill} disabled={busy} onPress={() => changeScreen('history')} />
      </View>
      {warnings.length > 0 && <Notice>{warnings.join('\n')}</Notice>}
      <QueryState query={query}>
        {!day ? <Empty title="Chưa có thực đơn" detail="Chọn số ngày và món bạn thích khi tạo thực đơn." icon={CalendarDays} /> : <>
          <View style={[ui.card, { backgroundColor: c.primaryLight }]}>
            <View style={ui.between}>
              <Text style={[ui.h2, ui.fill]}>{shortDate(plan.startDate)} – {shortDate(plan.endDate)}</Text>
              <Text style={ui.label}>{planNames[plan.status] || 'Thực đơn'}</Text>
            </View>
            {plan.status !== 'active' && <Button title={plan.status === 'draft' ? 'Dùng thực đơn này' : 'Dùng lại thực đơn'} disabled={busy} onPress={() => run('activate')} />}
            <Button title="Danh sách đi chợ" variant="outline" icon={ShoppingBasket} disabled={busy} onPress={() => run('shop')} />
          </View>
          <View style={ui.between}>
            <Text style={ui.label}>Ngày {selectedIndex + 1} / {planDays.length}</Text>
            <View style={ui.row}>
              <IconButton label="Ngày trước" icon={ChevronLeft} disabled={selectedIndex === 0 || busy} onPress={() => setDayDate(planDays[selectedIndex - 1].date)} />
              <IconButton label="Ngày sau" icon={ChevronRight} disabled={selectedIndex === planDays.length - 1 || busy} onPress={() => setDayDate(planDays[selectedIndex + 1].date)} />
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {planDays.map(item => <Chip key={item.date} label={shortDate(item.date)} selected={day.date === item.date} disabled={busy} onPress={() => setDayDate(item.date)} />)}
          </ScrollView>
          <View style={[ui.card, s.summary]}>
            <View style={ui.between}>
              <View style={ui.fill}><Text style={ui.eyebrow}>Dự kiến · {shortDate(day.date)}</Text><Text style={s.energy}>{number(day.total?.kcal, 'kcal')}</Text></View>
              <Utensils size={27} color={c.primary} strokeWidth={1.5} />
            </View>
            <View style={ui.row}>{[['Đạm', 'proteinG'], ['Tinh bột', 'carbG'], ['Béo', 'fatG']].map(([label, field]) => <View key={field} style={[ui.fill, s.metric]}>
              <Text style={ui.small}>{label}</Text><Text style={ui.label}>{number(day.total?.[field], 'g')}</Text>
            </View>)}</View>
            <QueryState query={diary}>
              {diary.data?.date === day.date && <>
                <Text style={ui.label}>{eaten}/{meals.length} bữa đã ghi · {number(diary.data?.consumed?.kcal, 'kcal')}</Text>
                {!!meals.length && <View accessible accessibilityRole="progressbar" accessibilityLabel="Bữa đã ghi nhận"
                  accessibilityValue={{ min: 0, max: meals.length, now: eaten }} style={s.track}>
                  <View style={[s.progress, { width: (100 * eaten / meals.length) + '%' }]} />
                </View>}
              </>}
            </QueryState>
            {day.date <= today() && <Button title="Mở nhật ký ngày này" variant="outline"
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
                <Button title="Đổi món" variant="outline" style={ui.fill} disabled={busy || done || diary.data?.date !== day.date || diary.isError} onPress={() => run('swap', { item: meal })} />
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

const s = StyleSheet.create({
  summary: { overflow: 'hidden', backgroundColor: c.stone },
  energy: { fontFamily: 'serif', fontSize: 32, color: c.ink, fontVariant: ['tabular-nums'] },
  metric: { padding: 8, backgroundColor: c.surface, borderRadius: 10 },
  track: { backgroundColor: c.line, height: 6, borderRadius: 6, overflow: 'hidden' },
  progress: { backgroundColor: c.primary, height: '100%' },
  mealTop: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 },
  thumb: { width: 58, height: 58, borderRadius: 10 },
  shopRow: { ...ui.between, minHeight: 50, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.line },
  check: { width: 25, height: 25, borderWidth: 1, borderColor: c.line, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
