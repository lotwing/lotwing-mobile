import React from 'react';
import {
  AsyncStorage,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

import buttonStyles from '../constants/ButtonStyles';
import pageStyles from '../constants/PageStyles';
import textStyles from '../constants/TextStyles';

import LotActionHelper from '../helpers/LotActionHelper';

export default class NoteScreen extends React.Component {
	constructor(props) {
		super(props);
		this.details = this.props.navigation.state.params;
		this.showSaveTagViews = this.showSaveTagViews.bind(this);
		this.sendNoteData = this.sendNoteData.bind(this);

		this.state = {
			isNoteActionVisible: true,
			placeholderText: 'Write your vehicle note here.'
		}
	}

	showSaveTagViews() {
		this.setState({isNoteActionVisible: false});
	}

	sendNoteData() {
		console.log('\nsendFuelData called');
		console.log('\nNote: ', this.state.placeholderText);

		//TODO(adwoa): make save button unclickable, process this action
		let space_data = LotActionHelper.structureTagPayload('note', this.details, this.state.placeholderText);
		let noteScreen = this;
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
		    LotActionHelper.backAction(this.props.navigation);
		  })
		  .catch(err => {
		    console.log('\nCAUHT ERROR: \n', err, err.name);
		    //TODO(adwoa): make save button clickable again
		    return err
		  });
	}

	_renderProperNoteActionView() {
		if (this.state.isNoteActionVisible) {
			return (
				<TouchableWithoutFeedback
					onPress={() => {Keyboard.dismiss()}}
					accessible={false}>
					<View
						style={{flex:7, alignItems: 'center', justifyContent: 'center'}}>
						
						<View style={[pageStyles.noteCard, {marginTop: '20%', height:'40%'}]}>
			  				<TextInput
								editable={true}
								multiline={true}
								onChangeText={(placeholderText) => this.setState({placeholderText})}
			 					placeholder={this.state.placeholderText} />
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
				  				onPress={this.sendNoteData}>
				  				<Text style={[buttonStyles.activeSecondaryTextColor, {fontWeight: '300', fontSize: 20}]}>
				  					SAVE NOTE
				  				</Text>
				  			</TouchableOpacity>
			  			</View>
			  		</View>
		  		</TouchableWithoutFeedback>
	  			);

		} else {
			// This batch of code is not currently ever reached.... we don't need a 
			// second confirmation screen when you're trying to save a note. Either
			// click save or navigate back

			// TODO(adwoa): either delete this or make the thing below a component that's more easily callable

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
		  					Vehicle note: {this.state.placeholderText}
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
		            	{this.details.year} {this.details.make} {this.details.model}
		            </Text>
		          	<Text style={textStyles.subtitle}>
		          		SKU {this.details.stockNumber}
		          	</Text>
	  			</View>

	  			<View style={pageStyles.column}>
		          <Image
		            source={require('../assets/images/note-white.png')}
		            style={[buttonStyles.icon, {padding: 10, minWidth: 30}]}
		            resizeMode={"contain"}/>
		        </View>
  			</View>

  			{this._renderProperNoteActionView()}

  		</View>
  	);
  }
}