// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';
import SignUpScreen from './SignUpScreen';
import AddEventScreen from './AddEventScreen';
import DetailsEvent from './DetailsEvent';
import UserAccountScreen from './UserAccountScreen';
import TwoFAScreen from './TwoFAScreen';
import DetailsEventOrga from './DetailsEventOrga';
import MapsScreen from './MapsScreen';
import ScanScreen from './ScanScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: { token: string };
  TwoFA: { telephone: string; password: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#a0efe7' },
          headerTintColor: '#114943',
        }}
         >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateEvent" component={AddEventScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="DetailsEvent" component={DetailsEvent} />
        <Stack.Screen name="UserAccount" component={UserAccountScreen} />
        <Stack.Screen name="TwoFA" component={TwoFAScreen} />
        <Stack.Screen name="DetailsEventOrga" component={DetailsEventOrga} />
        <Stack.Screen name="Maps" component={MapsScreen} />
        <Stack.Screen name="Scan" component={ScanScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
