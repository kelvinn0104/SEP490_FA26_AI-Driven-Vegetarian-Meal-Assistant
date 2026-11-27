import React from 'react';
import { View } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Compass, CalendarDays, ScanLine, Users, UserRound } from 'lucide-react-native';
import { c } from '../styles/theme';
import { useAuthStore } from '../store/useAuthStore';
import { Frame, Pending } from '../components/ui/Kit';
import { HomeScreen } from '../screens/home/HomeScreen';
import { RecipeDetailScreen } from '../screens/home/RecipeDetailScreen';
import { VisionScanScreen } from '../screens/ai/VisionScanScreen';
import { ChatbotScreen } from '../screens/ai/ChatbotScreen';
import { PlannerScreen } from '../screens/planner/PlannerScreen';
import { CommunityScreen } from '../screens/community/CommunityScreen';
import { PostDetailScreen } from '../screens/community/PostDetailScreen';
import { CreatePostScreen } from '../screens/community/CreatePostScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { HealthProfileScreen } from '../screens/profile/HealthProfileScreen';
import { SavedRecipesScreen } from '../screens/profile/SavedRecipesScreen';
import { NutritionScreen } from '../screens/profile/NutritionScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OtpScreen } from '../screens/auth/OtpScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: c.background, card: c.surface, text: c.ink, border: c.line, primary: c.primary } };
const tabs = [
  ['HomeTab', 'Khám phá', Compass, HomeScreen],
  ['PlannerTab', 'Thực đơn', CalendarDays, PlannerScreen],
  ['VisionTab', 'Quét ảnh', ScanLine, VisionScanScreen],
  ['CommunityTab', 'Cộng đồng', Users, CommunityScreen],
  ['ProfileTab', 'Cá nhân', UserRound, ProfileScreen],
];

function MainTabs() {
  const { bottom } = useSafeAreaInsets();
  return <Tab.Navigator backBehavior="history" screenOptions={{
    headerShown: false,
    tabBarHideOnKeyboard: true,
    tabBarActiveTintColor: c.ink,
    tabBarInactiveTintColor: c.muted,
    tabBarStyle: { height: 64 + bottom, paddingTop: 4, paddingBottom: 5 + bottom, backgroundColor: c.surface, borderTopColor: c.line },
    tabBarItemStyle: { minHeight: 48 },
    tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
  }}>
    {tabs.map(([name, label, Icon, Screen]) => <Tab.Screen key={name} name={name} component={Screen} options={{
      tabBarLabel: label,
      tabBarAccessibilityLabel: label,
      tabBarIcon: ({ color, focused }) => <View style={{
        minWidth: 46, minHeight: 28, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
        backgroundColor: focused ? c.lime : 'transparent',
      }}><Icon color={color} size={20} strokeWidth={focused ? 2 : 1.7} /></View>,
    }} />)}
  </Tab.Navigator>;
}

export function AppNavigator() {
  const signedIn = useAuthStore(state => !!state.token);
  const loading = useAuthStore(state => state.isLoading);
  if (loading) return <Frame><View style={{ flex: 1, justifyContent: 'center' }}><Pending label="Đang mở VeggieAI…" /></View></Frame>;

  return <NavigationContainer theme={navTheme}>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="Chatbot" component={ChatbotScreen} />
      {signedIn ? <>
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
        <Stack.Screen name="HealthProfile" component={HealthProfileScreen} />
        <Stack.Screen name="SavedRecipes" component={SavedRecipesScreen} />
        <Stack.Screen name="Nutrition" component={NutritionScreen} />
      </> : <>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="OtpVerify" component={OtpScreen} />
      </>}
    </Stack.Navigator>
  </NavigationContainer>;
}
