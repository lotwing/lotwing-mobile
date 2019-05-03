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

import Timer from '../components/Timer';

import buttonStyles from '../constants/ButtonStyles';
import pageStyles from '../constants/PageStyles';
import textStyles from '../constants/TextStyles';

import LotActionHelper from '../helpers/LotActionHelper';

export default class FuelScreen extends React.Component {
	constructor(props) {
		super(props);
		this.details = this.props.navigation.state.params;
		this.startOrStopAction = this.startOrStopAction.bind(this);

		this.endFueling = this.endFueling.bind(this);

		this.fuelEventId = null;

		this.state = {
			isFuelActionVisible: true,
			isStopButtonVisible: false,
			fuelTime: '0:01',
			startStopButtonText: 'START FUELING',
		};

		console.log('NAVIGATION DATA: ', this.props.navigation.state);
	}

	startFuelingAction() {
		console.log('\nstartFuelingAction called');
		console.log('\nFuel Time: ', this.state.fuelTime);

		//TODO(adwoa): make save button unclickable, process this action
		let space_data = LotActionHelper.structureTagPayload(GlobalVariables.BEGIN_FUELING, this.details, 'starting to fuel');
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
		  	console.log(responseJson);
		  	this.fuelEventId = responseJson['event'] ? responseJson['event']['id'] : null;
		  	fuelScreen.startFuelTimer();
		  })
		  .catch(err => {
		    console.log('\nCAUHT ERROR: \n', err, err.name);
		    //TODO(adwoa): make save button clickable again
		    return err
		  });
	}

	startFuelTimer() {
		this.setState({
			isStopButtonVisible: true,
			startStopButtonText: 'STOP FUELING',
		});
	}

	endFueling(shouldAcknowledgeAction) {
		let fuelScreen = this;
		let endedPackage = {};

		if (shouldAcknowledgeAction) {
			endedPackage = {
				acknowledged: shouldAcknowledgeAction,
				event_details: 'fueled in ' + fuelScreen.state.fuelTime
			}
		} else {
			endedPackage = {
				acknowledged: shouldAcknowledgeAction,
				event_details: 'fuel event ' + this.fuelEventId + ' canceled'
			}
		}

		let eventIdPromise = LotActionHelper.getEventId(this.details.spaceId);

		eventIdPromise.then((event_id) => {
			console.log('EVENT ID: ', event_id);
			let fuelEndPromise = LotActionHelper.endTimeboundTagAction(endedPackage, event_id);
			fuelEndPromise.then(() => {
				fuelScreen.confirmTagRegistered();
			});
		});

	}

	// helper function for timer
	setFuelTime = (timeDisplayed) => {
		this.setState({fuelTime: timeDisplayed});
	}

	showSaveTagViews() {
		this.setState({
			isFuelActionVisible: false,
		});
	}

	startOrStopAction() {
		if (!this.state.isStopButtonVisible) {
			this.startFuelingAction();
		} else {
			this.showSaveTagViews();
		}
	}

	confirmTagRegistered() {
		// push back to lotscreen
		this.props.navigation.goBack();
	}

	_renderTimerOnStart(startTime) {
		if (this.state.isStopButtonVisible) {
			return (
				<Timer 
  					startTime={startTime}
  					fuelTime={this.setFuelTime}>
  				</Timer>
  				)
		} else {
			return (
				<Text style={textStyles.timer}>
	            	00:00:00
	            </Text>
	        )
		}
	}

	_renderProperFuelActionView() {
		if (this.state.isFuelActionVisible) {
			let startTime = Date.now();
			return (
				<View
					style={{flex:7}}>
					<View 
		  				style={{flex: 4, justifyContent: 'center', alignItems: 'center'}}>
		  				{this._renderTimerOnStart(startTime)}
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
			  				onPress={this.startOrStopAction}>
			  				<Text style={[buttonStyles.activeSecondaryTextColor, {fontWeight: '300', fontSize: 20}]}>
			  					{this.state.startStopButtonText}
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
	  					style={[pageStyles.noteCard, {height:'40%'}]}>
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
			  				onPress={() => {this.endFueling(false)}}>
			  				<Text style={[buttonStyles.activeSecondaryTextColor, {fontWeight: '300', fontSize: 20}]}>
			  					CANCEL
			  				</Text>
			  			</TouchableOpacity>

				  		<TouchableOpacity style={
			  				[
			  					buttonStyles.activePrimaryModalButton,
			  					{width: '40%', paddingTop: 15, paddingBottom: 15}
			  				]}
			  				onPress={() => {this.endFueling(true)}}>
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
							SKU {this.details.stockNumber}</Text>
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