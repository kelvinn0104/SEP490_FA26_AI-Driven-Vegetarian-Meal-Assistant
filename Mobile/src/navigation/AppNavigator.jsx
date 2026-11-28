import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Compass, CalendarDays, Leaf, Users, UserRound } from 'lucide-react-native';
import { c, font, r } from '../styles/theme';
import { useAuthStore } from '../store/useAuthStore';
import { Frame, Pending } from '../components/ui/Kit';
import { BowlChopsticksIcon } from '../components/ui/Gauges';
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
import { NotificationsScreen } from '../screens/profile/NotificationsScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OtpScreen } from '../screens/auth/OtpScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: c.background,
    card: c.surface,
    text: c.ink,
    border: c.line,
    primary: c.terracotta,
  },
};

const tabs = [
  ['HomeTab', 'Khám phá', Compass, HomeScreen],
  ['PlannerTab', 'Thực đơn', CalendarDays, PlannerScreen],
  ['ChatTab', 'Trợ lý', BowlChopsticksIcon, ChatbotScreen],
  ['CommunityTab', 'Cộng đồng', Users, CommunityScreen],
  ['ProfileTab', 'Cá nhân', UserRound, ProfileScreen],
];

function MainTabs() {
  const { width } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();

  return (
    <Tab.Navigator
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: c.primaryDark,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: [s.bar, { height: 60 + bottom }],
        tabBarItemStyle: s.tabItem,
      }}
    >
      {tabs.map(([name, label, Icon, Screen]) => (
        <Tab.Screen key={name} name={name} component={Screen} options={{
          tabBarAccessibilityLabel: label,
          tabBarLabel: ({ focused, color }) => (
            <Text style={[s.tabLabel, { color, fontSize: width < 390 ? 10 : 11 }, focused && s.tabLabelActive]} numberOfLines={1}>{label}</Text>
          ),
          tabBarIcon: ({ focused, color }) => (
            <View style={[s.iconWrap, focused && s.activePill]}>
              <Icon color={color} size={20} strokeWidth={focused ? 2.15 : 1.7} />
            </View>
          ),
        }} />
      ))}
    </Tab.Navigator>
  );
}

export function AppNavigator({ fontsReady = true }) {
  const signedIn = useAuthStore(state => !!state.token);
  const loading = useAuthStore(state => state.isLoading);

  if (loading || !fontsReady) {
    return (
      <Frame>
        <View style={s.splash}>
          <Leaf size={26} color={c.primary} strokeWidth={1.9} />
          <Text style={s.splashBrand}>VeggieAI</Text>
          <Pending label="Đang mở ứng dụng…" />
        </View>
      </Frame>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: c.background },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
        {signedIn ? (
          <>
            <Stack.Screen name="VisionScan" component={VisionScanScreen} />
            <Stack.Screen name="CreatePost" component={CreatePostScreen} />
            <Stack.Screen name="HealthProfile" component={HealthProfileScreen} />
            <Stack.Screen name="SavedRecipes" component={SavedRecipesScreen} />
            <Stack.Screen name="Nutrition" component={NutritionScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="OtpVerify" component={OtpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const s = StyleSheet.create({
  bar: {
    paddingHorizontal: 6,
    backgroundColor: c.surfaceElevated,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.lineStrong,
  },
  tabItem: {
    paddingTop: 4,
    paddingBottom: 3,
  },
  activePill: {
    backgroundColor: c.primaryLight,
  },
  iconWrap: {
    height: 30,
    width: 53,
    borderRadius: r.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: font.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: c.muted,
    includeFontPadding: false,
    textAlign: 'center',
  },
  tabLabelActive: {
    fontFamily: font.semi,
    color: c.ink,
  },
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  splashBrand: {
    fontSize: 22,
    fontWeight: '600',
    color: c.ink,
    letterSpacing: -0.4,
  },
});
