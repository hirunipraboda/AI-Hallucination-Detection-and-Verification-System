import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ACTIVE_COLOR = '#00E5FF';
const INACTIVE_COLOR = '#7A8C99';
const TAB_BG = '#0A1118';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: TAB_BG,
          borderTopColor: '#1A252D',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'VERIFY',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="shield-check" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'DISCOVER',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="compass" color={color} />,
        }}
      />
    </Tabs>
  );
}
