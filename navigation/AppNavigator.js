import React from 'react';
import { 
	createStackNavigator, 
	createSwitchNavigator, 
} from 'react-navigation';

import {
  Image,
} from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import LotScreen from '../screens/LotScreen';
import FuelScreen from '../screens/FuelScreen';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';

class NavigationMenu extends React.Component {
  render() {
    return (
      <Image
        source={
          require('../assets/images/menu-wing.png')
        }
        style={{width: 43, height: 25, marginLeft: 20}}/>
    )
  }
}

const AppStack = createStackNavigator(
{ 
	Lot: LotScreen,
	Fuel: FuelScreen,
},
{
	navigationOptions: {
		headerStyle: {
			backgroundColor: '#BE1E2D',
		},
		headerTitle: <NavigationMenu />,
		headerTintColor: 'white',
	},
	
});
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