import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import ScoringDashboardScreen from './src/screens/ScoringDashboardScreen';
import ScoringDetailScreen from './src/screens/ScoringDetailScreen';
import GenerateScoreScreen from './src/screens/GenerateScoreScreen';
import { colors } from './src/theme/colors';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.textPrimary,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen
            name="ScoringDashboard"
            component={ScoringDashboardScreen}
            options={{ title: 'Confidence Scores' }}
          />
          <Stack.Screen
            name="ScoringDetail"
            component={ScoringDetailScreen}
            options={{ title: 'Score Details' }}
          />
          <Stack.Screen
            name="GenerateScore"
            component={GenerateScoreScreen}
            options={{ title: 'Generate Score' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
