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
		this.details = this.props.navigation.state.params.props;
		this.vehicle = this.props.navigation.state.params.vehicles[this.props.navigation.state.params.position]
		this.showSaveTagViews = this.showSaveTagViews.bind(this);
		this.startOrStopAction = this.startOrStopAction.bind(this);

		this.endFueling = this.endFueling.bind(this);

		this.fuelEventId = null;

		this.state = {
			isFuelActionVisible: true,
			isStopButtonVisible: false,
			fuelTime: '0:01',
			startStopButtonText: 'START FUELING',
		};

	}
	componentDidMount() {
		this.props.navigation.setParams({ extras: { } })
	}
	startFuelingAction() {
		let fuelScreen = this;
		let payload = LotActionHelper.structureTagPayload(GlobalVariables.BEGIN_FUELING, { vehicleId: fuelScreen.vehicle.id, spaceId: fuelScreen.details.spaceId }, 'starting to fuel');

		LotActionHelper.registerTagAction(payload)
			.then((responseJson) => {
				if (responseJson) {
					fuelScreen.fuelEventId = responseJson['event'] ? responseJson['event']['id']: null;
			    	fuelScreen.startFuelTimer();
				}
			})
			.catch(err => {
			    console.log('\nCAUGHT ERROR IN START DRIVING ACTION: \n', err, err.name);
			    return err
			});
	}

	startFuelTimer() {
		this.setState({
			isStopButtonVisible: true,
			startStopButtonText: 'END IN SAME LOCATION',
		});
		this.props.navigation.setParams({extras: { fuelEventId: this.fuelEventId,  spaceId: this.details.spaceId }})

	}

	endFueling(shouldAcknowledgeAction, updateLocation) {
		let fuelScreen = this;
		let endedPackage = {};

		this.props.navigation.setParams({extras: { updateLocation: updateLocation, spaceId: this.details.spaceId }})

		if (shouldAcknowledgeAction) {
			endedPackage = {
				acknowledged: shouldAcknowledgeAction,
				event_details: 'fueled in ' + fuelScreen.state.fuelTime
			}
		} else {
			endedPackage = {
				acknowledged: true, //shouldAcknowledgeAction,
				event_details: 'fuel event ' + this.fuelEventId + ' canceled'
			}
		}

		let eventIdPromise = LotActionHelper.getEventId(this.details.spaceId, 'fuel_vehicle');

		eventIdPromise.then((event_id) => {
			console.log('EVENT ID: ', event_id);
				event_id.forEach((id) => {
				LotActionHelper.endTimeboundTagAction(endedPackage, id);
			})
		}).then(() => {
			// fuelScreen.confirmTagRegistered();
			this.props.navigation.navigate('Lot', { extras: this.props.navigation.getParam("extras", {}), modalVisible: true, refresh: true, findingOnMap: false });
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
		// push back to lotscreen and refresh
		this.props.navigation.navigate('Lot', { extras: this.props.navigation.getParam("extras", {}), modalVisible: true, refresh: true, findingOnMap: false });
		//this.props.navigation.goBack();
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
		let startTime = Date.now();
		return (
			<View
				style={{flex:7}}>
				<View style={{flex: 4, justifyContent: 'center', alignItems: 'center'}}>
					{this._renderTimerOnStart(startTime)}
				</View>

				{ this.state.isStopButtonVisible?
					<View style={{flex:1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: 30}}>
				  	<TouchableOpacity
				  		style={[ buttonStyles.activePrimaryModalButton, { width: '90%', paddingTop: 15, paddingBottom: 15, marginLeft: 0 } ]}
				 			onPress={() => {this.endFueling(true, false)}}>
				 			<Text style={[buttonStyles.activePrimaryTextColor, {fontWeight: '300', fontSize: 20}]}>
				 				END IN SAME LOCATION
				 			</Text>
				 		</TouchableOpacity>
				  	<TouchableOpacity
				  		style={[ buttonStyles.activeSecondaryModalButton, { width: '90%', paddingTop: 15, paddingBottom: 15, marginTop: 30 } ]}
				 			onPress={() => {this.endFueling(true, true)}}>
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
			 					START FUELLING
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