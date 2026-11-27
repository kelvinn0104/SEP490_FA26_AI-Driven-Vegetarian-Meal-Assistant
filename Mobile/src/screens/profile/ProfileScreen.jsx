import React from 'react';
import { Alert, View, Text, StyleSheet } from 'react-native';
import { Activity, Bookmark, CalendarDays, HeartPulse, LogOut, MessageCircle, UserRound } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Page, Title, GuestGate, RowLink, Notice, ui } from '../../components/ui/Kit';
import { c } from '../../styles/theme';

export function ProfileScreen({ navigation }) {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const label = user?.displayName || user?.name || 'Tài khoản VeggieAI';
  const initials = user && label.trim().split(/\s+/).slice(-2).map(part => Array.from(part)[0]).join('').toLocaleUpperCase('vi-VN');

  return <Page title="Cá nhân" tab>
    <Title title="Bếp của bạn" />
    {!user ? <GuestGate navigation={navigation} icon={UserRound} title="Bạn đang xem với tư cách khách"
      detail="Tạo tài khoản để lưu món, theo dõi bữa ăn và chia sẻ với cộng đồng." /> : <>
      <View style={[ui.card, s.profile]}>
        <View style={s.avatar}><Text style={ui.h2}>{initials}</Text></View>
        <View style={ui.fill}><Text style={ui.h2}>{label}</Text><Text style={ui.body}>{user.email}</Text></View>
      </View>
      {user.hasHealthProfile === false && <Notice>Bạn có thể thêm hồ sơ bất cứ lúc nào. Hồ sơ chỉ cần khi lên thực đơn.</Notice>}
      <View style={ui.card}>
        <Text style={ui.eyebrow}>Bữa ăn</Text>
        <RowLink icon={HeartPulse} label="Hồ sơ sức khỏe" onPress={() => navigation.navigate('HealthProfile')} />
        <RowLink icon={Bookmark} label="Món đã lưu" onPress={() => navigation.navigate('SavedRecipes')} />
        <RowLink icon={CalendarDays} label="Xem thực đơn" onPress={() => navigation.navigate('PlannerTab')} />
        <RowLink icon={Activity} label="Nhật ký dinh dưỡng" onPress={() => navigation.navigate('Nutrition')} />
      </View>
    </>}
    <View style={ui.card}>
      <Text style={ui.eyebrow}>Trợ giúp vào bếp</Text>
      <RowLink icon={MessageCircle} label="Hỏi trợ lý" onPress={() => navigation.navigate('Chatbot')} />
    </View>
    {user && <Button title="Đăng xuất" variant="outline" icon={LogOut} onPress={() => Alert.alert('Đăng xuất?', 'Bạn vẫn có thể duyệt công thức và cộng đồng.', [
      { text: 'Hủy', style: 'cancel' }, { text: 'Đăng xuất', style: 'destructive', onPress: () => logout().catch(() => {}) },
    ])} />}
  </Page>;
}

const s = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.stone, gap: 14 },
  avatar: { width: 55, height: 55, borderRadius: 28, backgroundColor: c.lime, alignItems: 'center', justifyContent: 'center' },
});
