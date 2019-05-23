import React from 'react';
import {
  Animated,
  View,
  Text,
  TextInput,
  Button,
  Image,
  Platform,
  StyleSheet,
  ActionSheetIOS,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';

import buttonStyles from '../constants/ButtonStyles';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

import Mapbox from '@mapbox/react-native-mapbox-gl';

import pageStyles from '../constants/PageStyles';
import textStyles from '../constants/TextStyles';

/**
 *
 * Lot shapes include:
 * parking_lots, buildings, parking_spaces
 */
export default class TagModalView extends React.Component {
  constructor(props) {
    super(props);

    this.dismissModal = this.dismissModal.bind(this);
    this.confirmSpaceData = this.confirmSpaceData.bind(this);
    this.newStallNumber = '- -';
    this.newStockNumber = '- -';

    this.state = {
      modalContent: this.props.modalType,
    }
  }

  dismissModal() {
    this.props.setModalVisibility(false);
  }

  showChooseSpaceView() {
    this.props.setModalVisibility(false, GlobalVariables.CHOOSE_EMPTY_SPACE);
  }

  updateLotAndDismissModal() {
    this.props.updateLotAndDismissModal();
  }

  structureTagPayload(type, event_details) {
    // expects a valid type: tag, note, test_drive, fuel_vehicle, odometer_update
    let body = {
      'tag': {'vehicle_id': this.props.vehicleId, 'shape_id': this.props.spaceId}, 
      'event': {'event_type': type, 'event_details': event_details ? event_details : ''}
    }

    return body
  }

  makeAltViewVisible(contentType) {
    this.setState({modalContent: contentType});
  }

  confirmSpaceData() {
    console.log('\nconfirmSpaceData called');
    let space_data = this.structureTagPayload('tag');

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
        this.dismissModal();
      })
      .catch(err => {
        console.log('\nCAUHT ERROR: \n', err, err.name);
        return err
      });
  }

  launchPage(page_name) {
    this.dismissModal();

    if (page_name == 'drive') {
      this.props.navigation.navigate('Drive', this.props);
    } else if (page_name == 'fuel') {
      this.props.navigation.navigate('Fuel', this.props);
    } else if (page_name == 'camera') {

    } else if (page_name == 'note') {
      this.props.navigation.navigate('Note', this.props);
    }
  }

  _renderAltActionView() { // either stallChange, info, or base
    // car features that can be displayed
    // spaceId, make, model, year, color, sku

    if (this.state.modalContent == GlobalVariables.BASIC_MODAL_TYPE) {
      let vehicleColor = this.props.extraVehicleData.color ? this.props.extraVehicleData.color : '- -';
      
      return (
        <View
          style={styles.tagModalMainBody}>

          <Text style={styles.header}>
            {this.props.model}, {vehicleColor} </Text>
          <View
            style={styles.tagButtonContainer}>

            <ButtonWithImageAndLabel
              text={'Test Drive'}
              source={require('../assets/images/car-white.png')}
              onPress={() => {this.launchPage('drive')}}/>

            <ButtonWithImageAndLabel
              text={'Fuel Vehicle'}
              source={require('../assets/images/fuel-white.png')}
              onPress={() => {this.launchPage('fuel')}}/>

            <ButtonWithImageAndLabel
              text={'Camera'}
              source={require('../assets/images/camera-white.png')}
              onPress={() => {this.launchPage('camera')}}/>

            <ButtonWithImageAndLabel
              text={'Note'}
              source={require('../assets/images/note-white.png')}
              onPress={() => {this.launchPage('note')}}/>
          </View>

          <View
            style={pageStyles.rightButtonContainer}>

            <TouchableOpacity
              style={buttonStyles.activeSecondaryModalButton}
              onPress={() => {this.showChooseSpaceView()}}>
              <Text style={buttonStyles.activeSecondaryTextColor}>
                CHANGE STALL
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={buttonStyles.activePrimaryModalButton}
              onPress={this.confirmSpaceData}>
              <Text style={buttonStyles.activePrimaryTextColor}>
                CONFIRM
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      )

    } else if (this.state.modalContent == GlobalVariables.INFO_MODAL_TYPE) {
      return (
       <View
          style={styles.tagModalMainBody}>

          <Text style={styles.header}>
            {this.props.year} {this.props.make} {this.props.model}</Text>
          <View
            style={{visible: this.state.modalContent}}>

            <View
              style={[pageStyles.noteCard, {width: '100%', paddingTop: 20, borderRadius: 0}]}>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={textStyles.modalDataHeader}>
                  Mileage</Text>
                <Text style={textStyles.modalData}>
                  {this.props.extraVehicleData.mileage} miles</Text>
              </View>

              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={textStyles.modalDataHeader}>
                  Time in Stock</Text>
                <Text style={textStyles.modalData}>
                  {this.props.extraVehicleData.age_in_days} days</Text>
              </View>   
            </View>
          </View>
        </View>
      )

    } else if (this.state.modalContent == GlobalVariables.STALL_ENTRY_MODAL_TYPE) {
      return (
        <View
          style={styles.tagModalMainBody}>

          <Text style={styles.header}>
            {this.props.year} {this.props.make} {this.props.model}</Text>
          <View
            style={{width: '100%', marginTop: 20, borderRadius: 0, paddingTop: 20}}>
            <Text style={[textStyles.modalDataHeader, {color: 'white'}]}>
              Stall Number</Text>
            <TextInput
              autoCapitalize='characters'
              multiline={false}
              style={[textStyles.greyBackgroundTextInput, textStyles.largeText, {textAlign: 'center'}]}
              placeholder={this.props.spaceId}
              placeholderTextColor='rgba(237, 235, 232, 0.5)'
              onChangeText={(stallNumber) => {this.newStallNumber = stallNumber}}
              onSubmitEditing={(event) => this.props.updateLotAndDismissModal(event.nativeEvent.text, this.props.vehicleId)}
              returnKeyType='send'
              autoFocus={true}/>
          </View>
        </View>
      )
    } else if (this.state.modalContent == GlobalVariables.EMPTY_MODAL_TYPE) {
      //TODO(adwoa): EMPTY_MODAL_TYPE add feedback here
      return (
        <View
          style={[styles.tagModalMainBody, {width: '100%', borderRadius: 0, paddingTop: 20}]}>
          <Text style={[textStyles.modalDataHeader, {color: 'white'}]}>
            Populate Empty Space</Text>
          <TextInput
            autoCapitalize='characters'
            multiline={false}
            style={[textStyles.greyBackgroundTextInput, textStyles.largeText, {textAlign: 'center'}]}
            placeholder='Stock Number'
            placeholderTextColor='rgba(237, 235, 232, 0.5)'
            onChangeText={(stockNumber) => {this.newStockNumber = stockNumber}}
            onSubmitEditing={(event) => this.props.updateLotAndDismissModal(this.props.spaceId, null, event.nativeEvent.text)}
            returnKeyType='send'
            autoFocus={true}/>
        </View>
      )
    }
  }

  render() {
    let isBasicModal = this.state.modalContent == GlobalVariables.BASIC_MODAL_TYPE;
    let isOnMap = this.props.spaceId;

    let vehicleUsageType = this.props.extraVehicleData.is_used ? 'Used' : 'New';
    let modalTitle = isBasicModal ? isOnMap ? vehicleUsageType + ' ' + this.props.year + ' ' + this.props.make : 'Not in Stall' : ' ';
  	
    return (
      <KeyboardAvoidingView
        style={styles.tagModalOverlay} behavior="padding" enabled>

        <TouchableWithoutFeedback 
          onPress={() => {
            console.log('TOUCHING --OUTER-- VIEW');
            this.dismissModal();
          }}>
          <View
            style={styles.tagModalBlankSpace}>
          </View>
        </TouchableWithoutFeedback>

        <View style={styles.modalBottomContainer}>
          
          <View
            style={styles.tagModalStallBar}>
            <Text style={styles.stallHeader}> {this.props.stockNumber ? this.props.stockNumber : '   - -'} </Text>
            <Text style={styles.stallHeader}>{modalTitle}</Text>
          </View>

          {this._renderAltActionView()}

        </View>
      </KeyboardAvoidingView>
      
  	);
  }
}

class ButtonWithImageAndLabel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TouchableOpacity 
        activeOpacity={0.5}
        onPress={this.props.onPress}
        style={{width: 80, height: 50,}}>
        <View style={{flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <Image
            source={this.props.source}
            style={buttonStyles.icon}
            resizeMode={"contain"}/>
          <Text style={[buttonStyles.label, {marginTop: 5}]}>{this.props.text}</Text>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    fontSize: 18,
    fontWeight: '100',
    color: '#E6E4E0',
    paddingBottom: 5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '200',
    color: '#E6E4E0',
  },
  stallHeader: {
    fontSize: 20,
    fontWeight: '300',
    color: 'white',
    borderTopWidth: 4,
    borderBottomWidth: 3,
  },
  tagModalOverlay: {
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  tagModalBlankSpace: {
    height: '70%',
  },
  modalBottomContainer: {
    elevation: 1,
    shadowColor: '#00000050',
    shadowOpacity: 50,
    shadowRadius: 10,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  tagModalStallBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    height: 49,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: 'white',
    borderBottomColor: 'white',
    borderRightWidth: 10,
    borderRightColor: '#828282',
    backgroundColor: '#828282',
    paddingLeft: 5,
  },
  tagModalMainBody: {
    flexDirection: 'column',
    backgroundColor: '#828282',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    borderWidth: 14,
    borderColor: '#828282',
  },
  tagButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderWidth: 5,
    borderTopWidth: 12,
    borderBottomWidth: 10,
    borderColor: '#828282',
  }, 
});
