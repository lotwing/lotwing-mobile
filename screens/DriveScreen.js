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

import Timer from '../components/Timer';

import LotActionHelper from '../helpers/LotActionHelper';

export default class DriveScreen extends React.Component {
	constructor(props) {
		super(props);
		this.details = this.props.navigation.state.params.props;
		this.vehicle = this.props.navigation.state.params.props.vehicles[this.props.navigation.state.params.position]
		this.showSaveTagViews = this.showSaveTagViews.bind(this);

		this.startOrStopAction = this.startOrStopAction.bind(this);
		this.endTestDrive = this.endTestDrive.bind(this);

		this.driveEventId = null;

		this.state = {
			isDriveActionVisible: true,
			isStopButtonVisible: false,
			driveTime: '0:01',
			startStopButtonText: 'START TEST DRIVE',
		};
	}

	startDrivingAction() {
		let driveScreen = this;
		let payload = LotActionHelper.structureTagPayload(GlobalVariables.BEGIN_DRIVE, { vehicleId: driveScreen.vehicle.id, spaceId: driveScreen.details.spaceId }, 'starting test drive');
		LotActionHelper.registerTagAction(payload)
			.then((responseJson) => {
				if (responseJson) {
					driveScreen.driveEventId = responseJson['event'] ? responseJson['event']['id']: null;
			    	driveScreen.startTestDriveTimer();
				}
			})
			.catch(err => {
			    console.log('\nCAUGHT ERROR IN START DRIVING ACTION: \n', err, err.name);
			    return err
			});
	}

	startTestDriveTimer() {
		this.setState({
			isStopButtonVisible: true,
			startStopButtonText: 'STOP TEST DRIVE',
		});
	}

	setDriveTime = (timeDisplayed) => {
		this.setState({driveTime: timeDisplayed});
	}

	endTestDrive(shouldAcknowledgeAction) {
		let driveScreen = this;
		let endedPackage = {};

		if (shouldAcknowledgeAction) {
			endedPackage = {
				acknowledged: shouldAcknowledgeAction,
				event_details: 'test driven for ' + driveScreen.state.driveTime
			}
		} else {
			endedPackage = {
				acknowledged: true, //shouldAcknowledgeAction,
				event_details: 'drive event ' + this.driveEventId + ' canceled'
			}
		}

		let eventIdPromise = LotActionHelper.getEventId(this.details.spaceId, 'test_drive');

		eventIdPromise.then((event_id) => {
			console.log('EVENT ID: ', event_id);
			event_id.forEach((id) => {
				LotActionHelper.endTimeboundTagAction(endedPackage, id);
			})
		}).then(() => {
			this.props.navigation.navigate('Lot', { refresh: true });
			//LotActionHelper.backAction(driveScreen.props.navigation);
		});
	}

	showSaveTagViews() {
		this.setState({isDriveActionVisible: false});
	}

	startOrStopAction() {
		if (!this.state.isStopButtonVisible) {
			this.startDrivingAction();
		} else {
			this.showSaveTagViews();
		}
	}

	_renderTimerOnStart(startTime) {
		if (this.state.isStopButtonVisible) {
			return (
				<Timer
  					startTime={startTime}
  					fuelTime={this.setDriveTime}>
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

	_renderProperDriveActionView() {
		if (this.state.isDriveActionVisible) {
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
		  					Vehicle driven for {this.state.driveTime}
		  				</Text>
		  			</View>

		  			<View
		  				style={{flexDirection:'row', marginTop: 40}}>
			  			<TouchableOpacity style={
			  				[
			  					buttonStyles.activeSecondaryModalButton,
			  					{width: '40%', paddingTop: 15, paddingBottom: 15}
			  				]}
			  				onPress={() => {this.endTestDrive(false)}}>
			  				<Text style={[buttonStyles.activeSecondaryTextColor, {fontWeight: '300', fontSize: 20}]}>
			  					CANCEL
			  				</Text>
			  			</TouchableOpacity>

				  		<TouchableOpacity style={
			  				[
			  					buttonStyles.activePrimaryModalButton,
			  					{width: '40%', paddingTop: 15, paddingBottom: 15}
			  				]}
			  				onPress={() => {this.endTestDrive(true)}}>
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
		            {this.vehicle.year} {this.vehicle.make} {this.vehicle.model}</Text>
		          <Text style={textStyles.subtitle}>
		            SKU {this.vehicle.stockNumber}</Text>
		  			</View>
		  			<View style={pageStyles.column}>
		          <Image
		            source={require('../assets/images/car-white.png')}
		            style={[buttonStyles.icon, {padding: 10, minWidth: 30}]}
		            resizeMode={"contain"}/>
		        </View>
	  			</View>

	  			{this._renderProperDriveActionView()}


	  		</View>
	  	);
  }
}