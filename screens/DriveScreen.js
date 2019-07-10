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
		this.vehicle = this.props.navigation.state.params.vehicles[this.props.navigation.state.params.position]
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

	componentDidMount() {
		this.props.navigation.setParams({ extras: { } })
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
		this.props.navigation.setParams({extras: { driveEventId: this.driveEventId,  spaceId: this.details.spaceId }})
	}

	setDriveTime = (timeDisplayed) => {
		this.setState({driveTime: timeDisplayed});
	}

	endTestDrive(shouldAcknowledgeAction, updateLocation) {
		let driveScreen = this;
		let endedPackage = {};

		this.props.navigation.setParams({extras: { updateLocation: updateLocation,  spaceId: this.details.spaceId }})

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
			this.props.navigation.navigate('Lot', { extras: this.props.navigation.getParam("extras", {}), modalVisible: true, refresh: true, findingOnMap: false });
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
		let startTime = Date.now();
			return (
				<View style={{flex:7}}>
					<View style={{flex: 4, justifyContent: 'center', alignItems: 'center'}}>
						{this._renderTimerOnStart(startTime)}
		  		</View>
		  		{ this.state.isStopButtonVisible?
					<View style={{flex:1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: 30}}>
				  	<TouchableOpacity
				  		style={[ buttonStyles.activePrimaryModalButton, { width: '90%', paddingTop: 15, paddingBottom: 15, marginLeft: 0 } ]}
				 			onPress={() => {this.endTestDrive(true, false)}}>
				 			<Text style={[buttonStyles.activePrimaryTextColor, {fontWeight: '300', fontSize: 20}]}>
				 				END IN SAME LOCATION
				 			</Text>
				 		</TouchableOpacity>
				  	<TouchableOpacity
				  		style={[ buttonStyles.activeSecondaryModalButton, { width: '90%', paddingTop: 15, paddingBottom: 15, marginTop: 30 } ]}
				 			onPress={() => {this.endTestDrive(true, true)}}>
				 			<Text style={[buttonStyles.activeSecondaryTextColor, {fontWeight: '300', fontSize: 20}]}>
				 				END: UPDATE LOCATION
				 			</Text>
				 		</TouchableOpacity>
			 		</View>
			 	:
					<View style={[ pageStyles.row, {flex:1, justifyContent: 'center', alignItems: 'center', margin: 30} ]}>
			 			<TouchableOpacity
			 				style={[ buttonStyles.activeSecondaryModalButton, {width: '90%', paddingTop: 15, paddingBottom: 15}]}
			 				onPress={this.startOrStopAction}>
			 				<Text style={[buttonStyles.activeSecondaryTextColor, {fontWeight: '300', fontSize: 20}]}>
			 					START TEST DRIVE
			 				</Text>
			 			</TouchableOpacity>
					</View>
				}
		  </View>
  	);
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