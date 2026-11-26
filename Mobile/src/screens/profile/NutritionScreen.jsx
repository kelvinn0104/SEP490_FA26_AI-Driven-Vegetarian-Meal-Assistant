import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mealPlanService } from '../../api/services/mealPlanService';
import { apiRequest, writeJson } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Page, Title, Field, QueryState, Notice, ui } from '../../components/ui/Kit';
import { c } from '../../styles/theme';
import { mealNames, number, today, validDate } from '../../styles/content.mjs';

export function NutritionScreen({ route, navigation }) {
  const [date, setDate] = useState(route.params?.date || today());
  const [typedDate, setTypedDate] = useState(date);
  const [error, setError] = useState('');
  const query = useQuery({ queryKey: ['diary', date], queryFn: ({ signal }) => mealPlanService.daily(date, signal) });
  return <Page title="Nhật ký" back={navigation.goBack} keyboard>
    <Title title="Dinh dưỡng trong ngày" />
    <View style={ui.card}>
      <Field label="Ngày (năm-tháng-ngày)" value={typedDate} onChangeText={setTypedDate} maxLength={10} />
      <Button title="Xem ngày này" variant="outline" onPress={() => {
        if (!validDate(typedDate) || typedDate > today()) return setError('Chọn ngày hợp lệ, không sau hôm nay.');
        setError(''); setDate(typedDate);
      }} />
    </View>
    <Notice error>{error}</Notice>
    <QueryState query={query}>
      {query.data && <Diary key={date} date={date} data={query.data} />}
    </QueryState>
  </Page>;
}

function Diary({ date, data }) {
  const [steps, setSteps] = useState(data.steps == null ? '' : String(data.steps));
  const [burned, setBurned] = useState(data.kcalBurned == null ? '' : String(data.kcalBurned));
  const [saved, setSaved] = useState('');
  const client = useQueryClient();
  const action = useMutation({
    mutationFn: ({ id }) => {
      if (id) return apiRequest('/nutrition/logs/' + id, { method: 'DELETE' });
      const energy = Number(burned.replace(',', '.'));
      if (!/^\d+$/.test(steps) || Number(steps) > 200000 || !burned.trim() || !(energy >= 0 && energy <= 10000)) {
        throw new Error('Nhập từ 0–200.000 bước và 0–10.000 kcal.');
      }
      return writeJson('/nutrition/activity', { activityDate: date, steps: Number(steps), kcalBurned: energy }, 'PUT');
    },
    onSuccess: async (_, { id }) => {
      setSaved(id ? 'Đã bỏ ghi nhận bữa.' : 'Đã lưu vận động.');
      await client.invalidateQueries({ queryKey: ['diary', date] });
    },
  });
  return <>
    <Notice error>{action.error?.message}</Notice>
    <Notice>{saved}</Notice>
    <View style={[ui.card, { backgroundColor: c.primaryLight }]}>
      <Text style={ui.eyebrow}>Đã ghi nhận</Text>
      <Text style={[ui.hero, { fontSize: 34 }]}>{number(data.consumed?.kcal, 'kcal')}</Text>
      {data.target?.kcal > 0 && <Text style={ui.body}>Mục tiêu {number(data.target.kcal, 'kcal')}</Text>}
      <View style={ui.row}>{[['Đạm', 'proteinG', 'g'], ['Béo', 'fatG', 'g'], ['Tinh bột', 'carbG', 'g'], ['Sắt', 'ironMg', 'mg'], ['B12', 'b12Mcg', 'µg']].map(([label, key, unit]) =>
        <View key={key} style={{ minWidth: 74 }}><Text style={ui.small}>{label}</Text><Text style={ui.label}>{number(data.consumed?.[key], unit)}</Text></View>
      )}</View>
    </View>
    {data.alerts?.map((alert, index) => <Notice key={index}>{alert.message}</Notice>)}
    <View style={ui.card}>
      <Text style={ui.h2}>Các bữa đã ghi</Text>
      {!data.logs?.length && <Text style={ui.body}>Chưa có bữa ăn đã ghi cho ngày này.</Text>}
      {data.logs?.map(log => <View key={log.id} style={ui.between}>
        <View style={ui.fill}><Text style={ui.label}>{log.recipeTitle}</Text><Text style={ui.small}>{mealNames[log.mealType]} · {number(log.kcalConsumed, 'kcal')}</Text></View>
        <Button title="Bỏ ghi" variant="outline" disabled={action.isPending} onPress={() => Alert.alert('Bỏ ghi bữa ăn?', undefined, [
          { text: 'Hủy', style: 'cancel' }, { text: 'Bỏ ghi', onPress: () => action.mutate({ id: log.id }) },
        ])} />
      </View>)}
    </View>
    <View style={ui.card}>
      <Text style={ui.h2}>Vận động</Text>
      <Field label="Số bước" inputMode="numeric" value={steps} onChangeText={setSteps} editable={!action.isPending} />
      <Field label="Năng lượng tiêu hao (kcal)" inputMode="decimal" value={burned} onChangeText={setBurned} editable={!action.isPending} />
      <Button title="Lưu vận động" loading={action.isPending && !action.variables?.id} disabled={action.isPending} onPress={() => action.mutate({})} />
    </View>
  </>;
}
