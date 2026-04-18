import React from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import AnalyzeScreen from '../screens/AnalyzeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';
import SourcesListScreen from '../screens/SourcesListScreen';
import SourceDetailScreen from '../screens/SourceDetailScreen';
import AddSourceScreen from '../screens/AddSourceScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import ScoringDashboardScreen from '../screens/ScoringDashboardScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminFeedbackScreen from '../screens/AdminFeedbackScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const SourcesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SourcesList" component={SourcesListScreen} />
    <Stack.Screen name="SourceDetail" component={SourceDetailScreen} />
    <Stack.Screen name="AddSource" component={AddSourceScreen} />
  </Stack.Navigator>
);

const TAB_ICONS = {
  Analyze: 'search',
  Sources: 'shield-checkmark-outline',
  Scoring: 'bar-chart-outline',
  Feedbacks: 'chatbox-ellipses-outline',
  Settings: 'settings-outline',
};

function MainTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.backgroundAlt,
          borderTopColor: theme.border,
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={TAB_ICONS[route.name]}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Analyze" component={AnalyzeScreen} />
      <Tab.Screen name="Sources" component={SourcesStack} />
      <Tab.Screen name="Scoring" component={HistoryScreen} />
      <Tab.Screen name="Feedbacks" component={FeedbackScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        user.role === 'admin' ? (
          <>
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="SourcesList" component={SourcesListScreen} />
            <Stack.Screen name="SourceDetail" component={SourceDetailScreen} />
            <Stack.Screen name="AddSource" component={AddSourceScreen} />
            <Stack.Screen name="Feedbacks" component={AdminFeedbackScreen} />
            <Stack.Screen name="UserManagement" component={UserManagementScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
          </>
        )
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}