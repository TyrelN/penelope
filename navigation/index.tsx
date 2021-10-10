/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName, Pressable } from 'react-native';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import NotFoundScreen from '../screens/NotFoundScreen';
import TabOneScreen from '../screens/TodoTab';
import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import TabTwoScreen from '../screens/JournalTab';
import  TabThreeScreen from '../screens/PhotoTab';
import PhotoDetail from '../screens/PhotoDetail';
export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
      <Stack.Screen name="PhotoDetail" component={PhotoDetail} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="TodoTab"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarShowLabel: false,
      }}>
      <BottomTab.Screen
        name="TodoTab"
        component={TabOneScreen}
        options={({ navigation }: RootTabScreenProps<'TodoTab'>) => ({
          headerTintColor: "#FAC29A",
          title: "Reminders",
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
        })}
      />
       <BottomTab.Screen
        name="JournalTab"
        component={TabTwoScreen}
        options={{
          headerTintColor: "#FAC29A",
          title: 'Notes',
          tabBarIcon: ({ color }) => <TabBarIcon name="journal-outline" color={color} />,
        }}
      />
       <BottomTab.Screen
        name="PhotoTab"
        component={TabThreeScreen}
        options={{
          headerTintColor: "#FAC29A",
          title: 'References',
          tabBarIcon: ({ color }) => <TabBarIcon name="images-outline" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />;
}
