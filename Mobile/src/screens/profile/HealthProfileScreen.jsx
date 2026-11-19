import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../../styles/theme';
import { healthProfileService } from '../../api/services/healthProfileService';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { HeartPulse, Scale, Ruler, Sparkles } from 'lucide-react-native';

export function HealthProfileScreen({ navigation }) {
  const [profile, setProfile] = useState({
    heightCm: '',
    weightKg: '',
    age: '',
    gender: 'Nam',
    activityLevel: 'Vừa phải',
    goal: 'Duy trì vóc dáng',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    healthProfileService.getProfile()
      .then((data) => {
        if (data) {
          setProfile({
            heightCm: String(data.heightCm || data.height || ''),
            weightKg: String(data.weightKg || data.weight || ''),
            age: String(data.age || ''),
            gender: data.gender || 'Nam',
            activityLevel: data.activityLevel || 'Vừa phải',
            goal: data.goal || 'Duy trì vóc dáng',
          });
        }
      })
      .catch((err) => console.warn('Lỗi lấy profile:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await healthProfileService.updateProfile({
        heightCm: parseFloat(profile.heightCm) || 0,
        weightKg: parseFloat(profile.weightKg) || 0,
        age: parseInt(profile.age) || 25,
        gender: profile.gender,
        activityLevel: profile.activityLevel,
        goal: profile.goal,
      });
      Alert.alert('Thành công', 'Đã cập nhật hồ sơ sức khỏe & chỉ số dinh dưỡng!');
    } catch (err) {
      Alert.alert('Lỗi lưu', err.message || 'Không thể cập nhật hồ sơ.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Tính BMI nhanh
  const h = parseFloat(profile.heightCm) / 100;
  const w = parseFloat(profile.weightKg);
  const bmi = (h > 0 && w > 0) ? (w / (h * h)).toFixed(1) : null;

  return (
    <View style={styles.container}>
      <Header title="Hồ Sơ Sức Khỏe" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* BMI Card */}
        {bmi && (
          <View style={styles.bmiCard}>
            <View>
              <Text style={styles.bmiLabel}>Chỉ số BMI của bạn</Text>
              <Text style={styles.bmiVal}>{bmi}</Text>
            </View>
            <View style={styles.bmiStatusBox}>
              <Text style={styles.bmiStatusText}>
                {bmi < 18.5 ? 'Gầy' : bmi < 24.9 ? 'Chuẩn cân đối' : 'Thừa cân'}
              </Text>
            </View>
          </View>
        )}

        {/* Input fields */}
        <View style={styles.formSection}>
          <Text style={styles.fieldLabel}>Chiều cao (cm)</Text>
          <View style={styles.inputWrap}>
            <Ruler size={18} color={theme.colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              value={profile.heightCm}
              onChangeText={(val) => setProfile((p) => ({ ...p, heightCm: val }))}
              keyboardType="numeric"
              placeholder="170"
            />
          </View>

          <Text style={styles.fieldLabel}>Cân nặng (kg)</Text>
          <View style={styles.inputWrap}>
            <Scale size={18} color={theme.colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              value={profile.weightKg}
              onChangeText={(val) => setProfile((p) => ({ ...p, weightKg: val }))}
              keyboardType="numeric"
              placeholder="65"
            />
          </View>

          <Text style={styles.fieldLabel}>Tuổi</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={profile.age}
              onChangeText={(val) => setProfile((p) => ({ ...p, age: val }))}
              keyboardType="numeric"
              placeholder="22"
            />
          </View>

          <Text style={styles.fieldLabel}>Mục tiêu dinh dưỡng</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={profile.goal}
              onChangeText={(val) => setProfile((p) => ({ ...p, goal: val }))}
              placeholder="Giảm mỡ, tăng cơ hoặc duy trì"
            />
          </View>

          <Button
            title="Lưu Hồ Sơ Sức Khỏe"
            onPress={handleSave}
            loading={saving}
            style={{ marginTop: 16 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  bmiCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  bmiLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
  },
  bmiVal: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
  },
  bmiStatusBox: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  bmiStatusText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  formSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 6,
    marginTop: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    height: 46,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
