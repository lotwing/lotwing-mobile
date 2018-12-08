import React from 'react';
import { createStackNavigator } from 'react-navigation';

import LoginScreen from '../screens/LoginScreen';
import LotScreen from '../screens/LotScreen';


export default ScreenStack = createStackNavigator({
	Login: LoginScreen,
  	Lot: LotScreen,
  },
  {
	initialRouteName: 'Login',
});


// export default createSwitchNavigator({
//   // You could add another route here for authentication.
//   // Read more at https://reactnavigation.org/docs/en/auth-flow.html  // TODO(adwoa): take a deeper look at this
//   Main: MainTabNavigator,
// });