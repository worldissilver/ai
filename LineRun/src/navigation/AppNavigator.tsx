import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import EpisodeSelectScreen from '../screens/EpisodeSelectScreen';
import PracticeScreen from '../screens/PracticeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import StatsScreen from '../screens/StatsScreen';

export type RootStackParamList = {
  Home: undefined;
  EpisodeSelect: { showId: string; isResume?: boolean };
  Practice: {
    episodeId: string;
    startIndex?: number;
    showTitle: string;
    episodeTitle: string;
  };
  History: undefined;
  Stats: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'LineRun' }}
        />
        <Stack.Screen
          name="EpisodeSelect"
          component={EpisodeSelectScreen}
          options={{ title: '选择剧集' }}
        />
        <Stack.Screen
          name="Practice"
          component={PracticeScreen}
          options={({ route }) => ({ title: route.params.showTitle })}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: '练习历史' }}
        />
        <Stack.Screen
          name="Stats"
          component={StatsScreen}
          options={{ title: '我的统计' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
