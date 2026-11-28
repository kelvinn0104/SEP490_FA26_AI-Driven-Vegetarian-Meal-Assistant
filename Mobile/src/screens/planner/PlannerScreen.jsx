import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Keyboard,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  History,
  MessageCircle,
  Plus,
  RefreshCw,
  ShoppingBasket,
  Utensils,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { mealPlanService as api } from '../../api/services/mealPlanService';
import { healthProfileService } from '../../api/services/healthProfileService';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/Header';
import { StepProgress } from '../../components/ui/Gauges';
import {
  Badge,
  Chip,
  DateField,
  Empty,
  Field,
  GuestGate,
  Notice,
  Page,
  Pending,
  QueryState,
  RowLink,
  SectionHeader,
  SegmentedControl,
  ui,
} from '../../components/ui/Kit';
import { aisleTones, c, font, mealTones, r } from '../../styles/theme';
import {
  addDays,
  groupShoppingByAisle,
  ingredientLabel,
  isDemo,
  listOf,
  loggedMealIds,
  mealNames,
  number,
  planDisplayStatus,
  shortDate,
  today,
  validDate,
} from '../../styles/content.mjs';

const defaultMeals = ['breakfast', 'lunch', 'dinner'];
const dayFormat = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', timeZone: 'Asia/Ho_Chi_Minh' });
const shortDayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function weekdayCode(isoDate) {
  const dt = new Date(isoDate + 'T12:00:00Z');
  return shortDayLabels[dt.getUTCDay()];
}

async function loadPlan(id, signal) {
  if (id) {
    try {
      return await api.getPlan(id, signal);
    } catch (error) {
      if (error.status !== 404) throw error;
    }
  }
  const active = await api.getCurrentPlan(signal);
  if (active) return active;
  const recent = listOf(await api.getHistory(1, signal))[0];
  return recent ? api.getPlan(recent.id, signal) : null;
}

export function PlannerScreen(props) {
  const user = useAuthStore(state => state.user);
  if (!user) {
    return (
      <Page title="Thực đơn" tab>
        <GuestGate
          navigation={props.navigation}
          icon={CalendarDays}
          title="Lên lịch ăn chay"
          detail="Đăng nhập để tạo thực đơn và danh sách đi chợ."
        />
      </Page>
    );
  }
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
  const [shopping, setShopping] = useState(null);
  const [shopFilter, setShopFilter] = useState('all');
  const pending = useRef(false);

  const start = startMode === 'custom' ? customStart : addDays(today(), startMode === 'tomorrow' ? 1 : 0);
  const dayCount = Number(days);
  const dateOk = validDate(start);
  const daysOk = /^\d+$/.test(days) && dayCount >= 1 && dayCount <= 60;
  const end = dateOk && daysOk ? addDays(start, dayCount - 1) : '';
  const rangeOk = validDate(end);

  const profile = useQuery({
    queryKey: ['profile'],
    queryFn: ({ signal }) => healthProfileService.getProfile(signal),
    enabled: screen === 'create',
  });

  useEffect(() => {
    let live = true;
    SecureStore.getItemAsync(storageKey)
      .catch(() => null)
      .then(id => {
        if (live) setSelection(previous => (previous === undefined ? id || null : previous));
      });
    return () => {
      live = false;
    };
  }, [storageKey]);

  useEffect(() => {
    if (route.params?.createRequestedAt) setScreen('create');
  }, [route.params?.createRequestedAt]);

  const query = useQuery({
    queryKey: ['plan', selection],
    queryFn: ({ signal }) => loadPlan(selection, signal),
    enabled: selection !== undefined,
  });

  const plan = query.data;
  const planDays = plan?.days || [];
  const selectedIndex = Math.max(
    planDays.findIndex(d => d.date === dayDate),
    0
  );
  const day = planDays[selectedIndex];

  const history = useQuery({
    queryKey: ['plan-history', historyPage],
    queryFn: ({ signal }) => api.getHistory(historyPage, signal),
    enabled: screen === 'history',
  });

  const canLogDay = !!day && day.date <= today();
  const diary = useQuery({
    queryKey: ['diary', day?.date],
    queryFn: ({ signal }) => api.daily(day.date, signal),
    enabled: screen === 'plan' && canLogDay,
  });

  const logged = loggedMealIds(diary.data, day?.date);
  const meals = (day?.meals || []).filter(meal => !isDemo({ title: meal.recipeTitle }));
  const eaten = meals.filter(meal => logged.has(String(meal.id))).length;

  function selectPlan(next) {
    if (!next?.id || !Array.isArray(next.days)) throw new Error('Chưa nhận được thực đơn hợp lệ.');
    const id = String(next.id);
    client.setQueryData(['plan', id], next);
    setSelection(id);
    SecureStore.setItemAsync(storageKey, id).catch(() => {});
    setDayDate(previous => (next.days.some(item => item.date === previous) ? previous : next.days[0]?.date));
  }

  function changeScreen(next) {
    mutation.reset();
    setFeedback('');
    setScreen(next);
  }

  const mutation = useMutation({
    mutationFn: async ({ type, id, item }) => {
      if (type === 'generate') {
        return api.generatePlan({
          startDate: start,
          days: dayCount,
          note: note.trim() || null,
          mealTypes,
          ...(scanId && { scanId }),
        });
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
        setGeneration({ id: data.plan.id, source: data.generatedBy, warnings: data.validationWarnings || [] });
        setShowWarnings(false);
        setScreen('plan');
        navigation.setParams({ scanId: undefined, createRequestedAt: undefined });
      } else if (type === 'open' || type === 'activate' || type === 'swap') {
        selectPlan(data);
        if (type === 'open') {
          setScreen('plan');
        } else {
          setFeedback(type === 'activate' ? 'Thực đơn đã được áp dụng.' : 'Đã đổi món mới.');
        }
        if (type === 'activate') client.invalidateQueries({ queryKey: ['current-plan-home'] });
      } else if (type === 'log') {
        await client.invalidateQueries({ queryKey: ['diary', day?.date] });
        setFeedback('Đã ghi nhận bữa ăn.');
      } else if (type === 'shop') {
        if (!Array.isArray(data?.items)) throw new Error('Chưa nhận được danh sách đi chợ.');
        setShopping(data);
        setShopFilter('all');
        setScreen('shop');
      } else {
        if (!data || data.id !== item.id) throw new Error('Chưa xác nhận được món đã mua.');
        setShopping(previous => ({
          ...previous,
          items: previous.items.map(entry => (entry.id === item.id ? data : entry)),
        }));
      }
      if (['generate', 'activate', 'swap'].includes(type)) {
        client.invalidateQueries({ queryKey: ['plan-history'] });
        client.invalidateQueries({ queryKey: ['current-plan-home'] });
      }
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

  const backToPlan = useCallback(() => {
    if (busy) return;
    navigation.setParams({ scanId: undefined, createRequestedAt: undefined });
    changeScreen('plan');
  }, [busy, navigation]);

  useFocusEffect(
    useCallback(() => {
      if (screen === 'plan') return;
      const listener = BackHandler.addEventListener('hardwareBackPress', () => {
        backToPlan();
        return true;
      });
      return () => listener.remove();
    }, [screen, backToPlan])
  );

  const startNew = () => {
    navigation.setParams({ scanId: undefined, createRequestedAt: undefined });
    changeScreen('create');
  };

  const openRecipe = recipeId => navigation.navigate('RecipeDetail', { recipeId });
  const details = generation?.id === plan?.id ? generation : null;
  const generationPending = busy && mutation.variables?.type === 'generate';
  const checkHistory =
    mutation.variables?.type === 'generate' &&
    mutation.error &&
    (!mutation.error.status || mutation.error.status >= 500);

  const headerTitle = {
    plan: 'Thực đơn',
    create: 'Lên thực đơn',
    history: 'Thực đơn đã lưu',
    shop: 'Đi chợ',
  }[screen];

  const aisleGroups = useMemo(() => {
    const raw = shopping?.items || [];
    const filtered =
      shopFilter === 'todo'
        ? raw.filter(i => !i.isBought)
        : shopFilter === 'done'
          ? raw.filter(i => i.isBought)
          : raw;
    return groupShoppingByAisle(filtered);
  }, [shopping?.items, shopFilter]);

  const statusMeta = planDisplayStatus(plan);

  return (
    <Page
      title={headerTitle}
      tab
      back={screen !== 'plan' ? backToPlan : undefined}
      keyboard={screen === 'create'}
      action={
        screen === 'plan' ? (
          <View style={ui.row}>
            <IconButton
              label="Lịch sử thực đơn"
              icon={History}
              disabled={busy}
              onPress={() => changeScreen('history')}
            />
            <Button title="Tạo mới" icon={Plus} size="sm" variant="ink" disabled={busy} onPress={startNew} />
          </View>
        ) : null
      }
      refreshControl={
        screen === 'plan' ? (
          <RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} colors={[c.terracotta]} />
        ) : undefined
      }
    >
      <Notice error>{mutation.error?.message}</Notice>
      {checkHistory ? (
        <Button
          title="Kiểm tra bản nháp trong lịch sử"
          variant="outline"
          onPress={() => changeScreen('history')}
        />
      ) : null}
      <Notice success>{feedback}</Notice>
      {busy && !generationPending ? (
        <Pending
          label={
            {
              swap: 'Đang chọn món thay thế…',
              shop: 'Đang gom nguyên liệu…',
            }[mutation.variables?.type] || 'Đang cập nhật…'
          }
        />
      ) : null}

      {/* CREATE VIEW */}
      {screen === 'create' && (
        <>
          {generationPending ? (
            <Notice>
              Đang lên thực đơn {days} ngày và tính khẩu phần. Bạn có thể chuyển tab trong lúc chờ.
            </Notice>
          ) : null}

          <QueryState query={profile}>
            <RowLink
              label={profile.data ? 'Hồ sơ sức khỏe & dị ứng' : 'Thiết lập hồ sơ sức khỏe'}
              rightText={profile.data ? number(profile.data.tdee, 'kcal') : 'Cần thiết lập'}
              onPress={() => {
                if (!busy) navigation.navigate('HealthProfile');
              }}
            />
          </QueryState>

          {scanId ? <Notice>Ưu tiên nguyên liệu từ lượt quét ảnh đã xác nhận.</Notice> : null}

          <View style={ui.card}>
            <SectionHeader
              title="Lịch ăn"
              count={rangeOk ? `${shortDate(start)} – ${shortDate(end)}` : undefined}
            />
            <Text style={ui.label}>Bắt đầu từ</Text>
            <View style={ui.row}>
              {[
                ['today', 'Hôm nay'],
                ['tomorrow', 'Ngày mai'],
                ['custom', 'Chọn ngày'],
              ].map(([value, label]) => (
                <Chip
                  key={value}
                  label={label}
                  selected={value === startMode}
                  disabled={busy}
                  onPress={() => setStartMode(value)}
                />
              ))}
            </View>
            {startMode === 'custom' ? (
              <DateField
                label="Ngày bắt đầu"
                value={customStart}
                minYear={Number(today().slice(0, 4))}
                maxYear={Number(today().slice(0, 4)) + 2}
                disabled={busy}
                onChange={setCustomStart}
              />
            ) : null}

            <Text style={ui.label}>Thời lượng</Text>
            <View style={ui.row}>
              {[3, 7, 14].map(value => (
                <Chip
                  key={value}
                  label={`${value} ngày`}
                  selected={!customDays && String(value) === days}
                  disabled={busy}
                  onPress={() => {
                    setCustomDays(false);
                    setDays(String(value));
                  }}
                />
              ))}
              <Chip label="Tùy chọn" selected={customDays} disabled={busy} onPress={() => setCustomDays(true)} />
            </View>
            {customDays ? (
              <Field
                label="Số ngày (1–60)"
                value={days}
                onChangeText={setDays}
                inputMode="numeric"
                maxLength={2}
                editable={!busy}
              />
            ) : null}

            {!daysOk ? <Notice error>Chọn thời lượng từ 1 đến 60 ngày.</Notice> : null}
            {dateOk && daysOk && !rangeOk ? <Notice error>Khoảng ngày vượt giới hạn lịch.</Notice> : null}

            <View style={ui.divider} />

            <Text style={ui.label}>Bữa trong ngày</Text>
            <View style={ui.row}>
              {Object.entries(mealNames).map(([value, label]) => (
                <Chip
                  key={value}
                  label={label}
                  selected={mealTypes.includes(value)}
                  disabled={busy || (mealTypes.length === 1 && mealTypes.includes(value))}
                  onPress={() =>
                    setMealTypes(previous =>
                      previous.includes(value)
                        ? previous.filter(meal => meal !== value)
                        : [...previous, value]
                    )
                  }
                />
              ))}
            </View>

            <Field
              label="Ghi chú khẩu vị (tùy chọn)"
              placeholder="Ví dụ: món Việt thanh đạm, ít cay…"
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={500}
              editable={!busy}
            />
          </View>

          <Button
            title="Tạo thực đơn"
            loading={generationPending}
            disabled={busy || !rangeOk || !profile.data || profile.isError}
            onPress={() => run('generate')}
          />
        </>
      )}

      {/* HISTORY VIEW — Flat editorial list */}
      {screen === 'history' && (
        <QueryState query={history} skeletonCount={4}>
          {!listOf(history.data).length ? (
            <Empty
              title="Chưa có thực đơn nào"
              detail="Tạo lịch ăn tuần để lưu trữ tại đây."
              icon={CalendarDays}
            >
              <Button title="Tạo thực đơn" onPress={startNew} />
            </Empty>
          ) : (
            <View>
              {listOf(history.data).map((entry, idx, arr) => {
                const st = planDisplayStatus(entry);
                return (
                  <RowLink
                    key={entry.id}
                    border={idx < arr.length - 1}
                    label={`${shortDate(entry.startDate)} – ${shortDate(entry.endDate)}`}
                    detail={entry.itemCount > 0 ? `${entry.itemCount} bữa ăn` : undefined}
                    rightText={st.label}
                    onPress={() => {
                      if (!busy) run('open', { id: entry.id });
                    }}
                  />
                );
              })}
            </View>
          )}
          {(historyPage > 1 || historyPage < (history.data?.totalPages || 1)) && (
            <View style={ui.between}>
              <Button
                title="Trước"
                variant="outline"
                size="sm"
                disabled={historyPage <= 1 || busy}
                onPress={() => setHistoryPage(historyPage - 1)}
              />
              <Text style={ui.small}>
                Trang {historyPage} / {history.data?.totalPages || 1}
              </Text>
              <Button
                title="Sau"
                variant="outline"
                size="sm"
                disabled={historyPage >= (history.data?.totalPages || 1) || busy}
                onPress={() => setHistoryPage(historyPage + 1)}
              />
            </View>
          )}
        </QueryState>
      )}

      {/* SHOPPING LIST VIEW — Grouped by Vietnamese Market Aisles */}
      {screen === 'shop' && shopping && (
        <>
          <StepProgress
            label="Nguyên liệu đã chuẩn bị"
            current={shopping.items.filter(item => item.isBought).length}
            total={Math.max(1, shopping.items.length)}
          />

          <SegmentedControl
            options={[
              ['all', `Tất cả · ${shopping.items.length}`],
              ['todo', `Cần mua · ${shopping.items.filter(i => !i.isBought).length}`],
              ['done', `Đã có · ${shopping.items.filter(i => i.isBought).length}`],
            ]}
            value={shopFilter}
            onChange={setShopFilter}
          />

          {!aisleGroups.length ? (
            <Empty title="Không có nguyên liệu trong mục này" icon={ShoppingBasket} />
          ) : (
            <View style={{ gap: 18 }}>
              {aisleGroups.map(group => {
                const aisle = aisleTones[group.key] || aisleTones.pantry;
                const boughtInAisle = group.items.filter(i => i.isBought).length;
                return (
                  <View key={group.key} style={{ gap: 6 }}>
                    <View style={s.aisleHeader}>
                      <View style={[s.aisleBar, { backgroundColor: aisle.color }]} />
                      <Text style={[s.aisleTitle, { color: aisle.color }]}>{aisle.label}</Text>
                      <Text style={ui.countText}>
                        {boughtInAisle}/{group.items.length}
                      </Text>
                    </View>

                    <View style={ui.card}>
                      {group.items.map((item, idx) => (
                        <Pressable
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: !!item.isBought, disabled: busy }}
                          key={item.id}
                          disabled={busy}
                          style={[s.shopRow, idx === group.items.length - 1 && { borderBottomWidth: 0 }]}
                          onPress={() => run('buy', { item })}
                        >
                          <View style={[s.checkBox, item.isBought && s.checkBoxDone]}>
                            {item.isBought ? <Check size={14} color={c.ink} strokeWidth={2.5} /> : null}
                          </View>
                          <Text style={[s.shopName, ui.fill, item.isBought && s.boughtText]}>
                            {ingredientLabel(item.ingredientName)}
                          </Text>
                          <Text style={s.shopQty}>{number(item.quantityG, 'g')}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}

      {/* MAIN PLAN VIEW */}
      {screen === 'plan' && (
        <QueryState query={query} skeletonCount={3}>
          {!day ? (
            <Empty
              title="Chưa có thực đơn"
              icon={CalendarDays}
            >
              <Button title="Lên thực đơn" onPress={startNew} />
            </Empty>
          ) : (
            <>
              <View style={s.planMasthead}>
                <View style={ui.between}>
                  <View style={ui.row}>
                    <Badge
                      label={statusMeta.label}
                      tone={statusMeta.expired ? 'warm' : plan.status === 'active' ? 'soft' : 'neutral'}
                    />
                    <Text style={ui.small}>{planDays.length} ngày</Text>
                  </View>
                  {plan.status !== 'active' && !statusMeta.expired ? (
                    <Button
                      title="Áp dụng"
                      size="sm"
                      variant="primary"
                      disabled={busy}
                      onPress={() => run('activate')}
                    />
                  ) : null}
                </View>

                <Text accessibilityRole="header" style={s.planHeadline}>
                  {shortDate(plan.startDate)} – {shortDate(plan.endDate)}
                </Text>

                {statusMeta.expired ? (
                  <Notice warning>
                    Thực đơn đã kết thúc.
                  </Notice>
                ) : null}

                <View style={s.utilityStrip}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={() => run('shop')}
                    style={s.utilLink}
                  >
                    <ShoppingBasket size={16} color={c.terracotta} strokeWidth={1.9} />
                    <Text style={s.utilLinkText}>Đi chợ</Text>
                  </Pressable>
                  <View style={s.utilDot} />
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={() => navigation.navigate('ChatTab', { planId: plan.id })}
                    style={s.utilLink}
                  >
                    <MessageCircle size={16} color={c.inkSoft} strokeWidth={1.9} />
                    <Text style={[s.utilLinkText, { color: c.inkSoft }]}>Hỏi trợ lý</Text>
                  </Pressable>
                </View>
              </View>

              {details?.warnings?.length ? (
                <View style={ui.group}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setShowWarnings(prev => !prev)}
                    style={ui.between}
                  >
                    <Text style={ui.small}>Lưu ý cân đối dinh dưỡng ({details.warnings.length})</Text>
                    {showWarnings ? <ChevronUp size={15} color={c.muted} /> : <ChevronDown size={15} color={c.muted} />}
                  </Pressable>
                  {showWarnings ? <Notice warning>{details.warnings.join('\n')}</Notice> : null}
                </View>
              ) : null}

              {/* Full-Width 7-Day Grid (ZERO 7th-day cutoff!) */}
              <WeekRail days={planDays} day={day} index={selectedIndex} disabled={busy} select={setDayDate} />

              {/* Single Elevated Card: Today's Selected Day Summary & Meals */}
              <View style={ui.card}>
                <View style={ui.between}>
                  <View style={ui.fill}>
                    <Text style={s.selectedDayTitle}>
                      {dayFormat.format(new Date(day.date + 'T12:00:00Z'))}, {shortDate(day.date)}
                    </Text>
                    <Text style={s.dayMacroSummary}>
                      {number(day.total?.kcal, 'kcal')}
                      {day.kcalTarget > 0 ? ` / ${number(day.kcalTarget, 'kcal')}` : ''}
                      {'  ·  '}Đạm {number(day.total?.proteinG, 'g')}
                      {'  ·  '}Carb {number(day.total?.carbG, 'g')}
                    </Text>
                  </View>
                  {canLogDay ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => navigation.navigate('Nutrition', { date: day.date })}
                      style={ui.linkBtn}
                    >
                      <Text style={ui.linkText}>Nhật ký</Text>
                      <ChevronRight size={14} color={c.terracotta} strokeWidth={2} />
                    </Pressable>
                  ) : null}
                </View>

                {canLogDay && diary.data?.date === day.date && meals.length > 0 ? (
                  <View style={s.progressRow}>
                    <View style={s.progressStrip} importantForAccessibility="no-hide-descendants">
                      {meals.map(m => (
                        <View key={m.id} style={[s.progressSeg, logged.has(String(m.id)) && s.progressSegDone]} />
                      ))}
                    </View>
                    <Text style={ui.small}>{meals.filter(m => logged.has(String(m.id))).length}/{meals.length} bữa đã ghi</Text>
                  </View>
                ) : null}

                <View style={ui.divider} />

                {!meals.length ? (
                  <Empty title="Chưa xếp bữa cho ngày này" icon={Utensils} />
                ) : (
                  <View>
                    {meals.map((meal, idx) => {
                      const done = logged.has(String(meal.id));
                      const tone = mealTones[meal.mealType] || mealTones.lunch;
                      const canLogMeal =
                        !busy &&
                        !done &&
                        diary.data?.date === day.date &&
                        !diary.isError &&
                        day.date <= today() &&
                        plan.status === 'active';
                      const canSwapMeal =
                        !busy && !done && !(canLogDay && (diary.data?.date !== day.date || diary.isError));

                      return (
                        <View
                          key={meal.id}
                          style={[s.mealRow, idx === meals.length - 1 && { borderBottomWidth: 0 }]}
                        >
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={'Xem công thức ' + meal.recipeTitle}
                            onPress={() => openRecipe(meal.recipeId)}
                            style={[ui.fill, { gap: 3 }]}
                          >
                            <View style={ui.row}>
                              <View style={[s.mealDot, { backgroundColor: tone.fill }]} />
                              <Text style={[s.mealSession, { color: tone.text }]}>
                                {mealNames[meal.mealType] || 'Bữa ăn'}
                              </Text>
                            </View>
                            <Text style={s.mealDishTitle} numberOfLines={2}>
                              {meal.recipeTitle}
                            </Text>
                            <Text style={s.mealMeta}>
                              {number(meal.servings, 'phần')}  ·  {number(meal.nutrition?.kcal, 'kcal')}
                              {meal.nutrition?.proteinG != null ? `  ·  ${number(meal.nutrition.proteinG, 'g')} đạm` : ''}
                            </Text>
                          </Pressable>

                          {canSwapMeal ? (
                            <IconButton label={'Đổi món ' + meal.recipeTitle} icon={RefreshCw} tone="soft"
                              onPress={() => run('swap', { item: meal })} />
                          ) : null}

                          {(done || canLogMeal) ? (
                            <Pressable
                              accessibilityRole="button"
                              accessibilityLabel={done ? 'Đã ghi nhận' : 'Ghi nhận đã ăn ' + meal.recipeTitle}
                              disabled={!canLogMeal}
                              onPress={() => run('log', { item: meal })}
                              style={[s.mealCheckBtn, done && s.mealCheckDone]}
                            >
                              {done ? <Check size={14} color={c.ink} strokeWidth={2.4} /> : null}
                              <Text style={[s.mealCheckText, done && { fontFamily: font.semi }]}>
                                {done ? 'Đã ăn' : 'Ghi bữa'}
                              </Text>
                            </Pressable>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </>
          )}
        </QueryState>
      )}
    </Page>
  );
}

// 7-day plan fits 100% inside viewport with flex:1 columns; >7 days shows explicit scroll affordance
function WeekRail({ days, day, index, disabled, select }) {
  const scroll = useRef(null);
  const currentToday = today();
  const fitAll = days.length <= 7;

  const revealSelection = useCallback(() => {
    if (!fitAll) {
      scroll.current?.scrollTo({ x: Math.max(0, (index - 2) * 52), animated: false });
    }
  }, [fitAll, index]);

  useEffect(revealSelection, [revealSelection]);

  const renderItem = entry => {
    const selected = entry.date === day.date;
    const isToday = entry.date === currentToday;
    return (
      <Pressable
        key={entry.date}
        accessibilityRole="button"
        accessibilityLabel={'Ngày ' + shortDate(entry.date)}
        accessibilityState={{ selected, disabled }}
        disabled={disabled}
        style={[
          s.dayCell,
          fitAll ? { flex: 1 } : { width: 48 },
          selected && s.dayCellSelected,
        ]}
        onPress={() => select(entry.date)}
      >
        <Text style={[s.dayCode, selected && s.dayTextSelected]}>{weekdayCode(entry.date)}</Text>
        <Text style={[s.dayNumber, selected && s.dayTextSelected]}>{entry.date.slice(-2)}</Text>
        {isToday ? <View style={[s.todayDot, selected && { backgroundColor: '#FFFEFA' }]} /> : null}
      </Pressable>
    );
  };

  if (fitAll) {
    return <View style={s.weekGrid}>{days.map(renderItem)}</View>;
  }

  return (
    <View style={{ gap: 4 }}>
      <View style={ui.between}>
        <Text style={ui.small}>Ngày {index + 1}/{days.length}</Text>
        <Text style={ui.small}>Vuốt ngang ›</Text>
      </View>
      <ScrollView
        ref={scroll}
        onContentSizeChange={revealSelection}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6 }}
      >
        {days.map(renderItem)}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  planMasthead: {
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: c.primarySoft,
    borderRadius: r.xl,
  },
  planHeadline: {
    fontFamily: font.serifBold,
    fontSize: 26,
    lineHeight: 34,
    color: c.ink,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  utilityStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 1,
  },
  utilLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
  },
  utilLinkText: {
    fontFamily: font.semi,
    fontSize: 13.5,
    color: c.terracotta,
    includeFontPadding: false,
  },
  utilDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: c.lineStrong,
  },
  weekGrid: {
    flexDirection: 'row',
    gap: 5,
  },
  dayCell: {
    minHeight: 53,
    paddingVertical: 7,
    borderRadius: r.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.lineStrong,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dayCellSelected: {
    backgroundColor: c.ink,
    borderColor: c.ink,
  },
  dayCode: {
    fontFamily: font.regular,
    fontSize: 11,
    color: c.muted,
    includeFontPadding: false,
  },
  dayNumber: {
    fontFamily: font.medium,
    fontSize: 15,
    color: c.ink,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  dayTextSelected: {
    color: '#FFFEFA',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: c.terracotta,
    marginTop: 1,
  },
  selectedDayTitle: {
    fontFamily: font.serifBold,
    fontSize: 17.5,
    color: c.ink,
    textTransform: 'capitalize',
    includeFontPadding: false,
  },
  dayMacroSummary: {
    fontFamily: font.regular,
    fontSize: 12.5,
    color: c.muted,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
    marginTop: 2,
  },
  progressStrip: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    height: 5,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressSeg: {
    flex: 1,
    borderRadius: r.pill,
    backgroundColor: c.surfaceMuted,
  },
  progressSegDone: {
    backgroundColor: c.lime,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.line,
  },
  mealDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  mealSession: {
    fontFamily: font.medium,
    fontSize: 12,
    includeFontPadding: false,
  },
  mealDishTitle: {
    fontFamily: font.serifBold,
    fontSize: 16.5,
    lineHeight: 22,
    color: c.ink,
    includeFontPadding: false,
  },
  mealMeta: {
    fontFamily: font.regular,
    fontSize: 12.5,
    color: c.muted,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  mealCheckBtn: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    borderRadius: r.pill,
    borderWidth: 1,
    borderColor: c.lineStrong,
    backgroundColor: 'transparent',
  },
  mealCheckDone: {
    backgroundColor: c.lime,
    borderColor: c.lime,
  },
  mealCheckText: {
    fontFamily: font.regular,
    fontSize: 12,
    color: c.ink,
    includeFontPadding: false,
  },
  aisleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aisleBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  aisleTitle: {
    flex: 1,
    fontFamily: font.serifBold,
    fontSize: 16,
    includeFontPadding: false,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    minHeight: 46,
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
  },
  checkBox: {
    width: 22,
    height: 22,
    borderWidth: 1.3,
    borderColor: c.lineStrong,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxDone: {
    backgroundColor: c.lime,
    borderColor: c.lime,
  },
  shopName: {
    fontFamily: font.regular,
    fontSize: 14.5,
    color: c.ink,
    includeFontPadding: false,
  },
  boughtText: {
    color: c.muted,
    textDecorationLine: 'line-through',
  },
  shopQty: {
    fontFamily: font.regular,
    fontSize: 13,
    color: c.muted,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
});
