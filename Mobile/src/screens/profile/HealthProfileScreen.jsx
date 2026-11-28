import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, Square, SquareCheck } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { healthProfileService } from '../../api/services/healthProfileService';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { StepProgress } from '../../components/ui/Gauges';
import {
  Chip,
  DateField,
  Field,
  Notice,
  Page,
  QueryState,
  SearchBar,
  SectionHeader,
  Title,
  ui,
} from '../../components/ui/Kit';
import { c, font, r } from '../../styles/theme';
import { fold, listOf, number, today, validDate } from '../../styles/content.mjs';

const activity = [
  ['sedentary', 'Ít vận động', 'Làm việc văn phòng, ít đi lại'],
  ['light', 'Vận động nhẹ', 'Đi bộ hoặc tập nhẹ 1–2 buổi/tuần'],
  ['moderate', 'Vừa phải', 'Tập thể dục đều 3–5 buổi/tuần'],
  ['active', 'Năng động', 'Tập cường độ cao 6–7 buổi/tuần'],
  ['very_active', 'Rất nhiều', 'Vận động thể lực nặng hàng ngày'],
];

const goals = [
  ['loss', 'Giảm cân'],
  ['maintain', 'Duy trì vóc dáng'],
  ['gain', 'Tăng cân & cơ'],
];

const allergenLabels = {
  peanut: 'Đậu phộng (lạc)',
  soy: 'Đậu nành',
  'tree nuts': 'Các loại hạt cây',
  sesame: 'Mè (vừng)',
  mushroom: 'Nấm các loại',
  gluten: 'Gluten (lúa mì)',
};

const allergyLabel = allergy =>
  allergy.nameVi || allergenLabels[allergy.name?.trim().toLowerCase()] || allergy.name;

export function HealthProfileScreen({ navigation }) {
  const profile = useQuery({
    queryKey: ['profile'],
    queryFn: ({ signal }) => healthProfileService.getProfile(signal),
  });
  const allergies = useQuery({
    queryKey: ['allergies'],
    queryFn: ({ signal }) => healthProfileService.getAllergens(signal),
  });

  return (
    <Page title="Hồ sơ sức khỏe" back={navigation.goBack} keyboard>
      <Title
        eyebrow="Cân đối theo thể trạng"
        title="Chỉ số & dị ứng"
        detail="Dữ liệu được dùng để tính nhu cầu năng lượng (TDEE) và loại trừ nguyên liệu dị ứng khi lập thực đơn."
      />
      <QueryState query={profile} skeletonCount={2}>
        <ProfileForm profile={profile.data} allergies={allergies} navigation={navigation} />
      </QueryState>
    </Page>
  );
}

function ProfileForm({ profile, allergies, navigation }) {
  const [form, setForm] = useState(() => ({
    gender: profile?.gender || '',
    dateOfBirth: profile?.dateOfBirth || '',
    heightCm: profile?.heightCm == null ? '' : String(profile.heightCm),
    weightKg: profile?.weightKg == null ? '' : String(profile.weightKg),
    activityLevel: profile?.activityLevel || '',
    healthGoal: profile?.healthGoal || '',
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
      if (!form.activityLevel || !form.healthGoal) throw new Error('Chọn mức vận động và mục tiêu sức khỏe.');
      if (!form.allergyIds.length && !none) {
        throw new Error('Chọn nhóm dị ứng hoặc xác nhận không có dị ứng thực phẩm đã biết.');
      }
      return healthProfileService.updateProfile({
        ...form,
        heightCm: measurement(form.heightCm),
        weightKg: measurement(form.weightKg),
      });
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
    const dob = form.dateOfBirth.trim();
    const age =
      Number(current.slice(0, 4)) -
      Number(dob.slice(0, 4)) -
      (current.slice(5) < dob.slice(5) ? 1 : 0);
    if (!form.gender || !validDate(dob) || age < 10 || age > 120) {
      setError('Chọn giới tính và ngày sinh hợp lệ (độ tuổi 10–120).');
      return;
    }
    const height = measurement(form.heightCm);
    const weight = measurement(form.weightKg);
    if (!(height >= 50 && height <= 250 && weight >= 20 && weight <= 300)) {
      setError('Chiều cao hợp lệ từ 50–250 cm và cân nặng từ 20–300 kg.');
      return;
    }
    setError('');
    setStep(2);
  };

  const toggle = id => {
    setNone(false);
    change(
      'allergyIds',
      form.allergyIds.includes(id)
        ? form.allergyIds.filter(item => item !== id)
        : [...form.allergyIds, id]
    );
  };

  const metrics = saved || profile;
  const maxBirthYear = Number(today().slice(0, 4)) - 10;

  return (
    <>
      {/* Flat 3-Column Tabular Metrics Strip on Paper (replaces duplicate dark hero) */}
      {metrics ? (
        <View style={s.metricsStrip}>
          {[
            ['Chỉ số BMI', metrics.bmi, ''],
            ['Nhu cầu TDEE', metrics.tdee, 'kcal'],
            ['Đạm mục tiêu', metrics.targets?.proteinG, 'g'],
          ].map(([label, value, unit], idx, arr) => (
            <View style={[s.metricCell, idx < arr.length - 1 && s.metricDivider]} key={label}>
              <Text style={ui.small}>{label}</Text>
              <Text style={s.metricVal}>{number(value, unit)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {saved ? (
        <View style={{ gap: 10 }}>
          <Notice success>Hồ sơ sức khỏe đã được lưu thành công.</Notice>
          <Button title="Hoàn tất & quay lại" variant="done" icon={Check} onPress={navigation.goBack} />
        </View>
      ) : (
        <>
          {profile?.needsUpdate ? (
            <Notice warning>Hồ sơ của bạn đã lâu chưa cập nhật. Hãy kiểm tra lại cân nặng và mục tiêu.</Notice>
          ) : null}
          <Notice error>{error || mutation.error?.message}</Notice>

          {/* Single Focal Surface: Step Form */}
          <View style={ui.card}>
            <StepProgress
              label={step === 1 ? 'Bước 1: Chỉ số cơ thể' : 'Bước 2: Mức vận động & Dị ứng'}
              current={step}
              total={2}
            />

            {step === 1 ? (
              <>
                <Text style={ui.label}>Giới tính sinh học</Text>
                <View style={ui.row}>
                  {[
                    ['female', 'Nữ'],
                    ['male', 'Nam'],
                  ].map(([key, label]) => (
                    <Chip
                      key={key}
                      label={label}
                      selected={form.gender === key}
                      onPress={() => change('gender', key)}
                    />
                  ))}
                </View>

                <DateField
                  label="Ngày sinh"
                  value={form.dateOfBirth}
                  minYear={1925}
                  maxYear={maxBirthYear}
                  onChange={value => change('dateOfBirth', value)}
                />

                <View style={s.twoCols}>
                  <View style={ui.fill}>
                    <Field
                      label="Chiều cao (cm)"
                      inputMode="decimal"
                      placeholder="165"
                      value={form.heightCm}
                      onChangeText={value => change('heightCm', value)}
                    />
                  </View>
                  <View style={ui.fill}>
                    <Field
                      label="Cân nặng (kg)"
                      inputMode="decimal"
                      placeholder="56"
                      value={form.weightKg}
                      onChangeText={value => change('weightKg', value)}
                    />
                  </View>
                </View>

                <Button title="Tiếp tục bước 2" onPress={next} />
              </>
            ) : (
              <>
                <Text style={ui.label}>Mức vận động hàng tuần</Text>
                <View style={{ gap: 8 }}>
                  {activity.map(([key, label, sub]) => {
                    const active = form.activityLevel === key;
                    return (
                      <Pressable
                        key={key}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: active, disabled: mutation.isPending }}
                        disabled={mutation.isPending}
                        onPress={() => change('activityLevel', key)}
                        style={[s.choiceCard, active && s.choiceCardActive]}
                      >
                        <View style={ui.fill}>
                          <Text style={ui.label}>{label}</Text>
                          <Text style={ui.small}>{sub}</Text>
                        </View>
                        <View style={[s.radioDot, active && s.radioDotActive]} />
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={ui.label}>Mục tiêu dinh dưỡng</Text>
                <View style={ui.row}>
                  {goals.map(([key, label]) => (
                    <Chip
                      key={key}
                      label={label}
                      selected={form.healthGoal === key}
                      disabled={mutation.isPending}
                      onPress={() => change('healthGoal', key)}
                    />
                  ))}
                </View>

                <SectionHeader
                  title="Dị ứng thực phẩm"
                  count={
                    form.allergyIds.length
                      ? `Đã chọn ${form.allergyIds.length}`
                      : none
                        ? 'Không dị ứng'
                        : 'Cần xác nhận'
                  }
                />

                <QueryState query={allergies}>
                  {listOf(allergies.data).length > 7 ? (
                    <SearchBar
                      label="Tìm nhóm dị ứng"
                      placeholder="Tìm đậu phộng, mè, nấm…"
                      value={search}
                      onChangeText={setSearch}
                    />
                  ) : null}
                  <View>
                    {listOf(allergies.data)
                      .filter(item => fold(allergyLabel(item)).includes(fold(search)))
                      .map(item => (
                        <AllergyItem
                          key={item.id}
                          title={allergyLabel(item)}
                          checked={form.allergyIds.includes(item.id)}
                          disabled={mutation.isPending}
                          onPress={() => toggle(item.id)}
                        />
                      ))}
                    <AllergyItem
                      title="Tôi không có dị ứng thực phẩm đã biết"
                      checked={none}
                      disabled={mutation.isPending}
                      onPress={() => {
                        setNone(!none);
                        if (!none) change('allergyIds', []);
                      }}
                    />
                  </View>
                </QueryState>

                <Button
                  title="Lưu hồ sơ sức khỏe"
                  loading={mutation.isPending}
                  disabled={allergies.isPending || allergies.isError}
                  onPress={() => mutation.mutate()}
                />
                <Button
                  title="Quay lại chỉ số cơ thể"
                  variant="outline"
                  disabled={mutation.isPending}
                  onPress={() => {
                    mutation.reset();
                    setStep(1);
                  }}
                />
              </>
            )}
          </View>
        </>
      )}
    </>
  );
}

function AllergyItem({ title, checked, disabled, onPress }) {
  const Icon = checked ? SquareCheck : Square;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[s.allergyRow, checked && s.allergyChecked]}
    >
      <Icon size={20} color={checked ? c.ink : c.muted} strokeWidth={1.9} />
      <Text style={[ui.label, ui.fill]}>{title}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  metricsStrip: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: c.lineStrong,
  },
  metricCell: {
    flex: 1,
    paddingHorizontal: 8,
    gap: 3,
  },
  metricDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: c.line,
  },
  metricVal: {
    fontFamily: font.serifBold,
    fontSize: 19,
    color: c.ink,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  twoCols: {
    flexDirection: 'row',
    gap: 10,
  },
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: r.md,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.background,
  },
  choiceCardActive: {
    borderColor: c.ink,
    backgroundColor: c.surface,
  },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: c.lineStrong,
  },
  radioDotActive: {
    borderWidth: 5,
    borderColor: c.terracotta,
  },
  allergyRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
  },
  allergyChecked: {
    backgroundColor: c.surface,
  },
});
