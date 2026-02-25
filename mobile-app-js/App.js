import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import SourcesListScreen from './screens/SourcesListScreen';
import AddSourceScreen from './screens/AddSourceScreen';
import SourceDetailScreen from './screens/SourceDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 💡 This wraps the Sources tab with a Stack so we can
// navigate TO AddSourceScreen FROM SourcesListScreen
function SourcesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SourcesList" component={SourcesListScreen} />
      <Stack.Screen name="AddSource" component={AddSourceScreen} />
      <Stack.Screen name="SourceDetail" component={SourceDetailScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: '#1a1a2e' },
          tabBarActiveTintColor: '#9b59b6',
          tabBarInactiveTintColor: '#888',
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Sources"
          component={SourcesStack}
          options={{ tabBarIcon: () => <Text>🛡️</Text> }}
        />
        <Tab.Screen
          name="Detect"
          component={SourcesListScreen}
          options={{ tabBarIcon: () => <Text>🔍</Text> }}
        />
        <Tab.Screen
          name="History"
          component={SourcesListScreen}
          options={{ tabBarIcon: () => <Text>🕐</Text> }}
        />
        <Tab.Screen
          name="Settings"
          component={SourcesListScreen}
          options={{ tabBarIcon: () => <Text>⚙️</Text> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}