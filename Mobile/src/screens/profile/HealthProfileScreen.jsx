import React, { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { HeartPulse, Square, SquareCheck } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { healthProfileService } from '../../api/services/healthProfileService';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Page, Title, Field, Chip, Notice, QueryState, ui } from '../../components/ui/Kit';
import { c } from '../../styles/theme';
import { fold, listOf, number, today, validDate } from '../../styles/content.mjs';

const activity = [['sedentary', 'Ít vận động'], ['light', 'Nhẹ'], ['moderate', 'Vừa phải'], ['active', 'Nhiều'], ['very_active', 'Rất nhiều']];
const goals = [['maintain', 'Duy trì'], ['loss', 'Giảm cân'], ['gain', 'Tăng cân']];
const allergenLabels = { peanut: 'Đậu phộng (lạc)', soy: 'Đậu nành', 'tree nuts': 'Các loại hạt cây', sesame: 'Mè (vừng)', mushroom: 'Nấm', gluten: 'Gluten' };
const allergyLabel = allergy => allergy.nameVi || allergenLabels[allergy.name?.trim().toLowerCase()] || allergy.name;

export function HealthProfileScreen({ navigation }) {
  const profile = useQuery({ queryKey: ['profile'], queryFn: ({ signal }) => healthProfileService.getProfile(signal) });
  const allergies = useQuery({ queryKey: ['allergies'], queryFn: ({ signal }) => healthProfileService.getAllergens(signal) });
  return <Page title="Hồ sơ sức khỏe" back={navigation.goBack} keyboard>
    <Title title="Hồ sơ sức khỏe" detail="Chỉ số và dị ứng được dùng khi lập thực đơn." />
    <QueryState query={profile}>
      <ProfileForm profile={profile.data} allergies={allergies} navigation={navigation} />
    </QueryState>
  </Page>;
}

function ProfileForm({ profile, allergies, navigation }) {
  const [form, setForm] = useState(() => ({
    gender: profile?.gender || '', dateOfBirth: profile?.dateOfBirth || '',
    heightCm: profile?.heightCm == null ? '' : String(profile.heightCm), weightKg: profile?.weightKg == null ? '' : String(profile.weightKg),
    activityLevel: profile?.activityLevel || '', healthGoal: profile?.healthGoal || '',
    allergyIds: (profile?.allergies || []).map(item => item.id),
  }));
  const [none, setNone] = useState(!!profile && !profile.allergies?.length);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(null);
  const client = useQueryClient();
  const updateUser = useAuthStore(state => state.updateUser);
  const change = (key, value) => setForm(previous => ({ ...previous, [key]: value }));
  const measurement = value => Number(value.trim().replace(',', '.'));
  const mutation = useMutation({
    mutationFn: () => {
      if (allergies.isError || allergies.isPending) throw new Error('Chưa tải được danh mục dị ứng.');
      if (!form.activityLevel || !form.healthGoal) throw new Error('Chọn mức vận động và mục tiêu.');
      if (!form.allergyIds.length && !none) throw new Error('Chọn dị ứng hoặc xác nhận không có dị ứng đã biết.');
      return healthProfileService.updateProfile({ ...form, heightCm: measurement(form.heightCm), weightKg: measurement(form.weightKg) });
    },
    onSuccess: data => {
      if (!data?.id) throw new Error('Chưa xác nhận được hồ sơ đã lưu.');
      client.setQueryData(['profile'], data);
      client.invalidateQueries({ queryKey: ['diary'] });
      updateUser({ hasHealthProfile: true });
      setSaved(data);
    },
  });
  const next = () => {
    const current = today();
    const dob = form.dateOfBirth;
    const age = Number(current.slice(0, 4)) - Number(dob.slice(0, 4)) - (current.slice(5) < dob.slice(5) ? 1 : 0);
    if (!form.gender || !validDate(dob) || age < 10 || age > 120) {
      setError('Chọn giới tính và nhập ngày sinh hợp lệ. Độ tuổi hỗ trợ từ 10 đến 120.');
      return;
    }
    const height = measurement(form.heightCm);
    const weight = measurement(form.weightKg);
    if (!(height >= 50 && height <= 250 && weight >= 20 && weight <= 300)) {
      setError('Chiều cao từ 50–250 cm và cân nặng từ 20–300 kg.');
      return;
    }
    setError('');
    setStep(2);
  };
  const toggle = id => {
    setNone(false);
    change('allergyIds', form.allergyIds.includes(id) ? form.allergyIds.filter(item => item !== id) : [...form.allergyIds, id]);
  };
  const options = (field, values) => <View style={ui.row}>
    {values.map(([key, label]) => <Chip key={key} label={label} selected={form[field] === key} disabled={mutation.isPending} onPress={() => change(field, key)} />)}
  </View>;
  const metrics = saved || profile;

  return <>
    {metrics && <View style={[ui.card, s.summary]}>
      <View style={ui.between}><Text style={[ui.h2, ui.fill]}>{saved ? 'Hồ sơ đã lưu' : 'Chỉ số đã lưu'}</Text><HeartPulse size={23} color={c.primary} /></View>
      <View style={ui.row}>{[['BMI', metrics.bmi, ''], ['Nhu cầu', metrics.tdee, 'kcal'], ['Mục tiêu đạm', metrics.targets?.proteinG, 'g']].map(([label, value, unit]) =>
        <View style={[ui.fill, s.metric]} key={label}><Text style={ui.small}>{label}</Text><Text style={ui.label}>{number(value, unit)}</Text></View>)}</View>
    </View>}
    {saved ? <Button title="Quay lại" onPress={navigation.goBack} /> : <>
      {!!profile?.needsUpdate && <Notice>Hồ sơ đã lâu chưa cập nhật. Kiểm tra lại các chỉ số.</Notice>}
      <Notice error>{error || mutation.error?.message}</Notice>
      <View style={ui.card}>
        <Text style={ui.eyebrow}>Bước {step} / 2</Text>
        <Text accessibilityRole="header" style={ui.h2}>{step === 1 ? 'Chỉ số cơ thể' : 'Nhu cầu và dị ứng'}</Text>
        {step === 1 ? <>
          <Text style={ui.label}>Giới tính</Text>
          {options('gender', [['female', 'Nữ'], ['male', 'Nam']])}
          <Field label="Ngày sinh (năm-tháng-ngày)" placeholder="2000-09-25" maxLength={10}
            value={form.dateOfBirth} onChangeText={value => change('dateOfBirth', value)} />
          <Field label="Chiều cao (cm)" inputMode="decimal" value={form.heightCm} onChangeText={value => change('heightCm', value)} />
          <Field label="Cân nặng (kg)" inputMode="decimal" value={form.weightKg} onChangeText={value => change('weightKg', value)} />
          <Button title="Tiếp tục" onPress={next} />
        </> : <>
          <Text style={ui.label}>Vận động</Text>
          {options('activityLevel', activity)}
          <Text style={ui.label}>Mục tiêu</Text>
          {options('healthGoal', goals)}
          <Text style={ui.h2}>Dị ứng thực phẩm</Text>
          <Text style={ui.body}>{form.allergyIds.length ? 'Đã chọn ' + form.allergyIds.length + ' nhóm' : none ? 'Không có dị ứng đã biết' : 'Chưa xác nhận'}</Text>
          <QueryState query={allergies}>
            {listOf(allergies.data).length > 7 && <Field label="Tìm nhóm dị ứng" value={search} onChangeText={setSearch} />}
            {listOf(allergies.data).filter(item => fold(allergyLabel(item)).includes(fold(search))).map(item => (
              <AllergyItem key={item.id} title={allergyLabel(item)} checked={form.allergyIds.includes(item.id)} disabled={mutation.isPending} onPress={() => toggle(item.id)} />
            ))}
            <AllergyItem title="Không có dị ứng thực phẩm đã biết" checked={none} disabled={mutation.isPending}
              onPress={() => { setNone(!none); if (!none) change('allergyIds', []); }} />
          </QueryState>
          <Button title="Lưu hồ sơ" loading={mutation.isPending} disabled={allergies.isPending || allergies.isError} onPress={() => mutation.mutate()} />
          <Button title="Quay lại chỉ số" variant="outline" disabled={mutation.isPending} onPress={() => { mutation.reset(); setStep(1); }} />
        </>}
      </View>
    </>}
  </>;
}

function AllergyItem({ title, checked, disabled, onPress }) {
  const Icon = checked ? SquareCheck : Square;
  return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked, disabled }} disabled={disabled} onPress={onPress} style={s.allergy}>
    <Icon size={21} color={c.primary} /><Text style={[ui.label, ui.fill]}>{title}</Text>
  </Pressable>;
}

const s = StyleSheet.create({
  summary: { backgroundColor: c.primaryLight },
  metric: { minWidth: 72 },
  allergy: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.line },
});
