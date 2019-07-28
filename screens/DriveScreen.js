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
		this.eventId = this.props.navigation.state.params.eventId;
		this.startedAt = this.props.navigation.state.params.started_at;

		this.state = {
			eventRunning: false,
			driveTime: '0:01',
			eventId: 0
		};
	}

	componentDidMount() {
		console.log('Event ID: ', this.eventId)
		this.props.navigation.setParams({ extras: { } })
		if (this.eventId !== null && this.eventId !== undefined) {
			this.setState({ eventRunning: true, eventId: this.eventId })
		}
	}

	// create event tag and retrieve id
	startDrivingAction() {
		this.props.navigation.setParams({extras: { driveEventId: this.driveEventId,  spaceId: this.details.spaceId }})
		let payload = LotActionHelper.structureTagPayload(GlobalVariables.BEGIN_DRIVE, { vehicleId: this.vehicle.id, spaceId: this.details.spaceId }, 'starting test drive');
		LotActionHelper.registerTagAction(payload)
			.then((responseJson) => {
				if (responseJson) {
					this.eventId = responseJson['event'] ? responseJson['event']['id']: null;
			    this.startEvent(this.eventId);
				}
			})
			.catch(err => {
			    console.log('\nCAUGHT ERROR IN START DRIVING ACTION: \n', err, err.name);
			    return err
			});
	}
	// send the started_at time to the server, and start animation
	startEvent(eventId) {
		//let eventIdPromise = LotActionHelper.getEventId(this.details.spaceId, 'test_drive');
		const startPackage = {
			started_at: this.formatDate(Date.now())
		}
		console.log('start package', startPackage)
		let eventIdPromise = LotActionHelper.endTimeboundTagAction(startPackage, eventId)

		eventIdPromise.then(() => {
			this.setState({ eventRunning: true, eventId: eventId })
		});
	}

	// end test drive and send ended_at time to the server, then redirect user to place vehicle
	endTestDrive(shouldAcknowledgeAction) {
		this.props.navigation.setParams({extras: { updateLocation: true }})
		const endPackage = {
			ended_at: this.formatDate(Date.now()),
			acknowledged: true, // shouldAcknowledgeAction
			event_details: shouldAcknowledgeAction ? 'test driven for ' + this.state.driveTime : 'drive event ' + this.eventId + ' canceled'
		}

		let eventIdPromise = LotActionHelper.endTimeboundTagAction(endPackage, this.eventId).then(() => {
			this.props.navigation.navigate('Lot', { extras: this.props.navigation.getParam("extras", {}), modalVisible: true, refresh: true, findingOnMap: false });
			//LotActionHelper.backAction(driveScreen.props.navigation);
		});
	}

	formatDate(date) {
		const d = new Date(date)
		const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		const hours = d.getUTCHours()<10 ? `0${d.getUTCHours()}` : `${d.getUTCHours()}`
		const minutes = d.getUTCMinutes()<10 ? `0${d.getUTCMinutes()}` : `${d.getUTCMinutes()}`
		const seconds = d.getUTCSeconds()<10 ? `0${d.getUTCSeconds()}` : `${d.getUTCSeconds()}`
		return `${ days[d.getUTCDay()] }, ${ d.getUTCDate() } ${ months[d.getUTCMonth()] } ${ d.getUTCFullYear() } ${ hours }:${ minutes }:${ seconds } +0000`
	}

	setDriveTime = (timeDisplayed) => {
		this.setState({driveTime: timeDisplayed});
	}

	_renderTimerOnStart(startTime) {
		if (this.state.eventRunning) {
			return (
				<Timer
  				startTime={startTime}
  				fuelTime={this.setDriveTime}>
  			</Timer>
  		)
		}
		return <Text style={textStyles.timer}>00:00:00</Text>
	}

	_renderProperDriveActionView() {
		let startTime = Date.now();
		if (this.startedAt !== null && this.startedAt !== undefined) {
			console.log(this.startedAt)
			startTime = Date.parse(this.startedAt)
		}
		return (
			<View style={{flex:7}}>
				<View style={{flex: 4, justifyContent: 'center', alignItems: 'center'}}>
					{ this._renderTimerOnStart(startTime) }
		  	</View>
		  		{ this.state.eventRunning?
					<View style={{flex:1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: 30}}>
				  	<TouchableOpacity
				  		style={[ buttonStyles.activePrimaryModalButton, { width: '90%', paddingTop: 15, paddingBottom: 15, marginLeft: 0 } ]}
				 			onPress={() => {this.endTestDrive(false)}}>
				 			<Text style={[buttonStyles.activePrimaryTextColor, {fontWeight: '300', fontSize: 20}]}>
				 				CANCEL
				 			</Text>
				 		</TouchableOpacity>
				  	<TouchableOpacity
				  		style={[ buttonStyles.activeSecondaryModalButton, { width: '90%', paddingTop: 15, paddingBottom: 15, marginTop: 30 } ]}
				 			onPress={() => {this.endTestDrive(true)}}>
				 			<Text style={[buttonStyles.activeSecondaryTextColor, {fontWeight: '300', fontSize: 20}]}>
				 				END TEST DRIVE
				 			</Text>
				 		</TouchableOpacity>
			 		</View>
			 	:
					<View style={[ pageStyles.row, {flex:1, justifyContent: 'center', alignItems: 'center', margin: 30} ]}>
			 			<TouchableOpacity
			 				style={[ buttonStyles.activeSecondaryModalButton, {width: '90%', paddingTop: 15, paddingBottom: 15}]}
			 				onPress={()=> this.startDrivingAction()}>
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