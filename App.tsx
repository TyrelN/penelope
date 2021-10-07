import { StatusBar } from 'expo-status-bar';
import React from 'react';
import useDatabase from './hooks/useDatabase';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import { RootSiblingParent } from 'react-native-root-siblings';

export default function App() {

  SplashScreen.preventAutoHideAsync(); //don't hide just yet
  const isDbLoadingComplete = useDatabase();
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (isLoadingComplete && isDbLoadingComplete) {

    SplashScreen.hideAsync();// db is loaded, now we can show the app
    return (
    <RootSiblingParent>
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </SafeAreaProvider>
      </RootSiblingParent>
    );
  }
  else{
    return null;
  }
}
