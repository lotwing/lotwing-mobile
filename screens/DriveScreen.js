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
		this.details = this.props.navigation.state.params;
		this.showSaveTagViews = this.showSaveTagViews.bind(this);
		this.sendDrivingData = this.sendDrivingData.bind(this);

		this.state = {
			isDriveActionVisible: true,
			driveTime: '0:01',
		};
	}

	sendDrivingData() {
		let payload = LotActionHelper.structureTagPayload('test_drive', this.details, this.state.driveTime);
		LotActionHelper.registerTagAction(payload)
			.then((value) => {
				if (value) {
					LotActionHelper.backAction(this.props.navigation);
				}
			});
	}

	setDriveTime = (timeDisplayed) => {
		this.setState({driveTime: timeDisplayed});
	}

	showSaveTagViews() {
		this.setState({isDriveActionVisible: false});
	}

	_renderProperDriveActionView() {
		if (this.state.isDriveActionVisible) {
			let startTime = Date.now();
			return (
				<View
					style={{flex:7}}>
					<View 
						style={{flex: 4, justifyContent: 'center', alignItems: 'center'}}>
						<Timer 
		  					startTime={startTime}
		  					fuelTime={this.setDriveTime}>
		  				</Timer>
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
			  					STOP TEST DRIVE
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
			  				onPress={() => {this.sendDrivingData()}}>
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