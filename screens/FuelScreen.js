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

import LotActionHelper from '../helpers/LotActionHelper';

export default class FuelScreen extends React.Component {
	constructor(props) {
		super(props);
		this.details = this.props.navigation.state.params;
		this.sendFuelData = this.sendFuelData.bind(this);
	}

	sendFuelData() {
		console.log('\nsendFuelData called');
		console.log('\ndetails: ', this.details);

		console.log('\n\nLotActionHelper: \n', LotActionHelper);

		let space_data = LotActionHelper.structureTagPayload('fuel_vehicle', this.details);

		console.log('TAG DATA: ', space_data);

		return fetch(GlobalVariables.BASE_ROUTE + Route.TAG_VEHICLE , {
		    method: 'POST',
		    headers: {
		      'Accept': 'application/json',
		      'Content-Type': 'application/json',
		      'Authorization': 'Bearer '+ GlobalVariables.LOTWING_ACCESS_TOKEN,
		    },
		    body: JSON.stringify(space_data),
		  })
		  .then((response) => {
		    return response.json();
		  })
		  .then((responseJson) => {
		  	console.log('\n\nNAVIGATE BACK TO LOTSCREEN');
		    confirmTagRegistered();
		  })
		  .catch(err => {
		    console.log('\nCAUHT ERROR: \n', err, err.name);
		    return err
		  });
	}

	confirmTagRegistered() {
		
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
		  					{flex:1, justifyContent: 'center', alignItems: 'center', margin: 30}
		  				]}>
		  			<TouchableOpacity style={
		  				[
		  					buttonStyles.activeSecondaryModalButton,
		  					{width: '90%', paddingTop: 15, paddingBottom: 15}
		  				]}
		  				onPress={this.sendFuelData}>
		  				<Text style={[buttonStyles.activeSecondaryTextColor, {fontWeight: '300', fontSize: 20}]}>
		  					STOP FUELING
		  				</Text>
		  			</TouchableOpacity>
	  			</View>

	  		</View>
	  	);
  }
}