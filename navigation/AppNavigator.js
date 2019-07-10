import React from 'react';
import {
	createStackNavigator,
	createSwitchNavigator,
  createAppContainer
} from 'react-navigation';

import {
  Image,
  TouchableOpacity,
  Text,
  View
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import LoginScreen from '../screens/LoginScreen';
import LotScreen from '../screens/LotScreen';
import FuelScreen from '../screens/FuelScreen';
import DriveScreen from '../screens/DriveScreen';
import NoteScreen from '../screens/NoteScreen';
import HistoryScreen from '../screens/HistoryScreen';

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

const navigationOptions = ({ navigation }) => {
  return {
    headerLeft: (
      <TouchableOpacity onPress={() => navigation.navigate('Lot', { extras: navigation.getParam("extras", {}), showModal: true, findingOnMap: false })}>
        <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons type='ionicon' name={ 'ios-arrow-back'} size={ 25 } style={{ color: '#FFF' }} />
        </View>
      </TouchableOpacity>
    )
  }
}

const AppStack = createStackNavigator({
	Lot: LotScreen,
	Fuel: {
    screen: FuelScreen,
    navigationOptions: navigationOptions,
  },
	Drive:  {
    screen: DriveScreen,
    navigationOptions: navigationOptions,
  },
	Note:  {
    screen: NoteScreen,
    navigationOptions: navigationOptions,
  },
  History:  {
    screen: HistoryScreen,
    navigationOptions: navigationOptions,
  },
},{
  defaultNavigationOptions: {
    headerStyle: {
      backgroundColor: '#BE1E2D',
    },
    headerTitle: <NavigationMenu />,
    headerTintColor: 'white',
  }
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


const lotwingAppContainer = createAppContainer(switchNav);

export default lotwingAppContainer