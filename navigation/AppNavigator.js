import React from 'react';
import { createStackNavigator, createSwitchNavigator, createAppContainer} from 'react-navigation';

import LoginScreen from '../screens/LoginScreen';
import LotScreen from '../screens/LotScreen';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';



export default ScreenStack = createStackNavigator({
	Login: LoginScreen,
	Lot: LotScreen,
  },
  {
  	initialRouteName: 'Login',
});


// const AppStack = createStackNavigator({ Lot: LotScreen });
// const AuthStack = createStackNavigator({ Login: LoginScreen });

// export default createAppContainer(createSwitchNavigator(
// 	{
// 		AuthLoading: AuthLoadingScreen,
// 		App: AppStack,
//   		Auth: AuthStack
//   	},
//   	{
// 		initialRouteName: 'AuthLoading',
// 	}
//));


// export default createSwitchNavigator({
//   // You could add another route here for authentication.
//   // Read more at https://reactnavigation.org/docs/en/auth-flow.html  // TODO(adwoa): take a deeper look at this
//   Main: MainTabNavigator,
// });