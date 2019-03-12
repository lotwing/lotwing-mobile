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
		this.showSaveTagViews = this.showSaveTagViews.bind(this);
		this.sendFuelData = this.sendFuelData.bind(this);

		this.state = {
			isFuelActionVisible: true,
			fuelTime: 0,
		};
	}

	sendFuelData() {
		console.log('\nsendFuelData called');
		console.log('\nFuel Time: ', this.state.fuelTime);

		//TODO(adwoa): make save button unclickable, process this action
		let space_data = LotActionHelper.structureTagPayload('fuel_vehicle', this.details, this.state.fuelTime);
		let fuelScreen = this;
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
		    fuelScreen.confirmTagRegistered();
		  })
		  .catch(err => {
		    console.log('\nCAUHT ERROR: \n', err, err.name);
		    //TODO(adwoa): make save button clickable again
		    return err
		  });
	}

	showSaveTagViews() {
		this.setState({isFuelActionVisible: false});
	}

	confirmTagRegistered() {
		// push back to lotscreen
		this.props.navigation.goBack();
	}

	_renderProperFuelActionView() {
		if (this.state.isFuelActionVisible) {
			return (
				<View
					style={{flex:7}}>
					<View 
		  				style={{flex: 4}}>
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
			  				onPress={this.showSaveTagViews}>
			  				<Text style={[buttonStyles.activeSecondaryTextColor, {fontWeight: '300', fontSize: 20}]}>
			  					STOP FUELING
			  				</Text>
			  			</TouchableOpacity>
		  			</View>
		  		</View>
	  			);

		} else {

			return (
				<View 
	  				style={{flex:7, alignItems: 'center', justifyContent: 'center'}}>
	  				
	  				<View
	  					style={pageStyles.noteCard}>
		  				<Text
		  					style={textStyles.actionSummaryHeader}>
		  					Summary
		  				</Text>
		  				<Text
		  					style={[textStyles.actionSummaryText, {marginTop: 15}]}>
		  					Vehicle fueled for {this.state.fuelTime}
		  				</Text>
		  			</View>

		  			<View
		  				style={{flexDirection:'row', marginTop: 40}}>
			  			<TouchableOpacity style={
			  				[
			  					buttonStyles.activeSecondaryModalButton,
			  					{width: '40%', paddingTop: 15, paddingBottom: 15}
			  				]}
			  				onPress={() => {LotActionHelper.backAction(this.props.navigation)}}>
			  				<Text style={[buttonStyles.activeSecondaryTextColor, {fontWeight: '300', fontSize: 20}]}>
			  					CANCEL
			  				</Text>
			  			</TouchableOpacity>

				  		<TouchableOpacity style={
			  				[
			  					buttonStyles.activePrimaryModalButton,
			  					{width: '40%', paddingTop: 15, paddingBottom: 15}
			  				]}
			  				onPress={() => {this.sendFuelData()}}>
			  				<Text style={[buttonStyles.activePrimaryTextColor, {fontWeight: '300', fontSize: 20}]}>
			  					SAVE
			  				</Text>
			  			</TouchableOpacity>
			  		</View>

	  			</View>
	  			);
		}
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

	  			{this._renderProperFuelActionView()}
	  		</View>
	  	);
  }
}