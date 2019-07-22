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
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';

import { Camera, Permissions, FileSystem, Constants } from 'expo';
import Ionicons from 'react-native-vector-icons/Ionicons';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

import buttonStyles from '../constants/ButtonStyles';
import pageStyles from '../constants/PageStyles';
import textStyles from '../constants/TextStyles';

import LotActionHelper from '../helpers/LotActionHelper';

export default class NoteScreen extends React.Component {
	constructor(props) {
		super(props);
		this.details = this.props.navigation.state.params.props;
		this.vehicle = this.props.navigation.state.params.props.vehicles[this.props.navigation.state.params.position]
		this.showSaveTagViews = this.showSaveTagViews.bind(this);
		this.sendNoteData = this.sendNoteData.bind(this);

		this.state = {
			isNoteActionVisible: true,
			placeholderText: 'Write your vehicle note here.',
			//cameraOpen: false,
			//hasCameraPermission: null,
    	//type: Camera.Constants.Type.back,
    	//photos: []
		}
	}
	/*
	componentDidMount() {
    FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'LotWing').catch(e => {
      console.log(e, 'Directory exists');
    });
	}

	async askCameraPermissions() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  takePicture = () => {
    if (this.camera) {
      this.camera.takePictureAsync({ base64: true, onPictureSaved: this.onPictureSaved });
    }
    console.log('Photo taken')
	};

	onPictureSaved = async photo => {
    await FileSystem.moveAsync({
      from: photo.uri,
      to: `${FileSystem.documentDirectory}LotWing/${Date.now()}.jpg`,
    })
    this.setState({ cameraOpen: false});
    this.addPhoto(photo)
    //console.log(photo.base64);
    //this.setState({ newPhotos: true });
	}

	addPhoto(object) {
		const tempPhotos = []
		this.state.photos.forEach((photo) => {
			tempPhotos.push(photo)
		})
		tempPhotos.push(object)
		this.setState({ photos: tempPhotos })
	}
	*/

	showSaveTagViews() {
		this.setState({isNoteActionVisible: false});
	}

	sendNoteData() {
		console.log('\nsendFuelData called');
		console.log('\nNote: ', this.state.placeholderText);

		//TODO(adwoa): make save button unclickable, process this action
		let space_data = LotActionHelper.structureTagPayload('note', { vehicleId: this.vehicle.id, spaceId: this.details.spaceId }, this.state.placeholderText);
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
					<KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={Constants.statusBarHeight + 40} enabled style={{ flex: 1}}>
				<TouchableWithoutFeedback
					onPress={() => {Keyboard.dismiss()}}
					accessible={false}>
					<View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>

						<View style={[pageStyles.noteCard, { flex: 1, width: Dimensions.get('window').width - 40, margin: 20}]}>
			  			<TextInput
			  				style={{ flex: 1 }}
								editable={true}
								multiline={true}
								onChangeText={(placeholderText) => this.setState({placeholderText})}
			 					placeholder={this.state.placeholderText} />
			  		</View>
			  			{/*
			  			<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
				  			{ this.state.photos.map((photo) => { return <Text>{ photo.uri }</Text> })
				  			}
			  			</View>
			  		*/}
			  			<View style={{flex:0, width: Dimensions.get('window').width - 40, justifyContent: 'center', alignItems: 'center', margin: 20, flexDirection: 'column' }}>
				  			<TouchableOpacity style={
				  				[
				  					buttonStyles.activeSecondaryModalButton,
				  					{width: '100%', paddingTop: 15, paddingBottom: 15, marginRight: 0}
				  				]}
				  				onPress={this.sendNoteData}>
				  				<Text style={[buttonStyles.activeSecondaryTextColor, {fontWeight: '300', fontSize: 20}]}>
				  					SAVE NOTE
				  				</Text>
				  			</TouchableOpacity>

				  			{ /*
				  				<TouchableOpacity style={[ buttonStyles.activePrimaryModalButton, { width: '90%', paddingTop: 15, paddingBottom: 15, marginTop: 15, marginLeft: 0 }]}
			  				onPress={() => this.setState({cameraOpen: true })}>
				  				<Text style={[buttonStyles.activePrimaryTextColor, {fontWeight: '300', fontSize: 20}]}>CAMERA</Text>
				  			</TouchableOpacity>
				  		*/}
				  		</View>
				  		</View>


		  		</TouchableWithoutFeedback>
			  		</KeyboardAvoidingView>
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
		//console.log('Camera Open: ', this.state.cameraOpen, 'Camera has Permissions: ', this.state.hasCameraPermission)
		/*
		if (this.state.cameraOpen) {
			if (this.state.hasCameraPermission === null) {
				this.askCameraPermissions();
				return <View />
			} else {
				console.log('should show camera')
				return (
					<View style={{ flex: 1 }}>
						<Camera style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }} type={this.state.type} ref={ref => this.camera = ref }>
							<View style={{ width:40, height: 40, justifyContent: 'center', alignItems: 'center', margin: 20  }}>
								<TouchableOpacity
				          onPress={()=> this.setState({ cameraOpen: false})}
				          style={{ flex: 1 }}
				        >
				        	<View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 20 }}>
				           <Text style={{ color: '#FFF', fontSize: 30, fontWeight: 'bold', lineHeight: 40 }}>×</Text>
				          </View>
								</TouchableOpacity>
							</View>
							<View style={{ width: Dimensions.get('window').width, height: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
								<TouchableOpacity
				          onPress={this.takePicture}
				          style={{ flex: 1 }}
				        >
				        	<View style={{ width: 60, height: 60, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
				          <Ionicons type='ionicon' name={ 'ios-radio-button-on'} size={40} style={{ color: '#FFF' }} />
				          </View>
								</TouchableOpacity>
							</View>
						</Camera>
					</View>
				)
			}
		}*/
  	return (
  		<View style={[pageStyles.container, {justifyContent: 'flex-start', backgroundColor: '#E6E4E0'}]}>
	  		<View style={[pageStyles.darkBody, pageStyles.row, {justifyContent: 'space-between'}]}>

	  			<View style={[pageStyles.darkBody, pageStyles.column]}>
	  				<Text style={textStyles.header}>
		            	{this.vehicle.year} {this.vehicle.make} {this.vehicle.model}
		            </Text>
		          	<Text style={textStyles.subtitle}>
		          		SKU {this.vehicle.stockNumber}
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