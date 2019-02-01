import React from 'react';
import { 
	createStackNavigator, 
	createSwitchNavigator, 
} from 'react-navigation';

import LoginScreen from '../screens/LoginScreen';
import LotScreen from '../screens/LotScreen';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';


const AppStack = createStackNavigator({ Lot: LotScreen });
const AuthStack = createStackNavigator({ Login: LoginScreen });

const switchNav = createSwitchNavigator(
	{
		App: AppStack,
  		Auth: AuthStack,
		AuthLoading: AuthLoadingScreen,
  	},
  	{
		initialRouteName: 'AuthLoading',
	}
);


export default switchNav;

// TODO(adwoa): IF and WHEN we update the react-navigation dependency to version 
// 3.0 we should use createAppContainer
// const lotwingAppContainer = createAppContainer(switchNav); 