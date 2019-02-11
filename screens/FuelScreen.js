import React from 'react';
import {
  AsyncStorage,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

import buttonStyles from '../constants/ButtonStyles';
import pageStyles from '../constants/PageStyles';
import textStyles from '../constants/TextStyles';

export default class FuelScreen extends React.Component {
	constructor(props) {
		super(props);
		this.details = this.props.navigation.state.params;
	}

	render() {
  	return (
  		<View style={[pageStyles.container, {justifyContent: 'flex-start', backgroundColor: '#E6E4E0'}]}>
	  		<View style={[pageStyles.darkBody, pageStyles.row, {justifyContent: 'space-between'}]}>
	  			<View style={[pageStyles.darkBody, pageStyles.column]}>
	  				<Text style={textStyles.header}>
	            {this.details.year} {this.details.make} {this.details.model}</Text>
	          <Text style={textStyles.subtitle}>
	            {this.details.vehicleId}</Text>
	  			</View>
	  			<View style={pageStyles.column}>
	          <Image
	            source={require('../assets/images/fuel-white.png')}
	            style={[buttonStyles.icon, {padding: 10, minWidth: 30}]}
	            resizeMode={"contain"}/>
	        </View>
  			</View>

  			<View style={{flex: 4}}>
  			</View>

  			<View style={
	  				[
	  					pageStyles.row, 
	  					{flex:1, justifyContent: 'center', alignItems: 'center'}
	  				]}>
	  			<TouchableOpacity style={
	  				[
	  					buttonStyles.activeSecondaryModalButton,
	  					{width: '90%'}
	  				]}>
	  				<Text style={[buttonStyles.activeSecondaryTextColor, {fontWeight: 'bold', fontSize: 20}]}>
	  					STOP FUELING
	  				</Text>
	  			</TouchableOpacity>
  			</View>

  		</View>
  	);
  }
}