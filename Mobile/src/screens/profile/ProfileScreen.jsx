import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { theme } from '../../styles/theme';
import { useAuthStore } from '../../store/useAuthStore';
import {
  User,
  HeartPulse,
  Bookmark,
  History,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';

export function ProfileScreen({ navigation }) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất không?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    {
      icon: HeartPulse,
      title: 'Hồ Sơ Sức Khỏe & BMI',
      sub: 'Mục tiêu dinh dưỡng, dị ứng, chiều cao, cân nặng',
      onPress: () => navigation.navigate('HealthProfile'),
    },
    {
      icon: Bookmark,
      title: 'Món Chay Đã Lưu',
      sub: 'Các công thức bạn yêu thích',
      onPress: () => navigation.navigate('SavedRecipes'),
    },
    {
      icon: History,
      title: 'Lịch Sử Thực Đơn',
      sub: 'Các kế hoạch ăn uống trước đây',
      onPress: () => navigation.navigate('PlannerTab'),
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <User size={36} color="#ffffff" />
        </View>
        <Text style={styles.userName}>{user?.displayName || 'Người dùng Veggie'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <ShieldCheck size={12} color={theme.colors.primaryDark} />
          <Text style={styles.roleText}>Thành viên thuần chay</Text>
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.menuSection}>
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={idx}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconBox}>
                <Icon size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <ChevronRight size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Nút Đăng Xuất */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut size={18} color={theme.colors.error} style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Đăng Xuất</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>VeggieAI Mobile v1.0 • Capstone SEP490</Text>
    </ScrollView>
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
  userCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    marginTop: 8,
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  menuSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  menuSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#fee2e2',
    marginTop: 8,
  },
  logoutText: {
    color: theme.colors.error,
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 24,
  },
});
