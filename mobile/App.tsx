import 'react-native-gesture-handler';
import React from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExplanationListScreen from './src/screens/ExplanationListScreen';
import ExplanationDetailScreen from './src/screens/ExplanationDetailScreen';

export type RootStackParamList = {
  Explanations: undefined;
  ExplanationDetail: { responseId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const headerOptions = {
  headerStyle: { backgroundColor: '#050816' as const },
  headerTintColor: '#e5e7eb',
  headerTitleStyle: {
    fontWeight: '600' as const,
    fontSize: 18,
    color: '#f9fafb',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  headerShadowVisible: false,
};

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={headerOptions}>
        <Stack.Screen name="Explanations" component={ExplanationListScreen} />
        <Stack.Screen
          name="ExplanationDetail"
          component={ExplanationDetailScreen}
          options={{ title: 'Transparency report' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

