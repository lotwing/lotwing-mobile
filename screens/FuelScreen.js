import React from 'react';
import {
  AsyncStorage,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

export default class FuelScreen extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		
  	return (
  		<View style={{backgroundColor: '#E6E4E0'}}>
  				<Text>Fuel Component</Text>
  		</View>
  	);
  }
}