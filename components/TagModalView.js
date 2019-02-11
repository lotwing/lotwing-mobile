import React from 'react';
import {
  Animated,
  View,
  Text,
  Button,
  Image,
  Platform,
  StyleSheet,
  ActionSheetIOS,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

import buttonStyles from '../constants/ButtonStyles';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

import Mapbox from '@mapbox/react-native-mapbox-gl';

/**
 *
 * Lot shapes include:
 * parking_lots, buildings, parking_spaces
 */
export default class TagModalView extends React.Component {
  constructor(props) {
    super(props);

    this.dismissModal = this.dismissModal.bind(this);
  }

  dismissModal() {
    this.props.setModalVisibility(false);
  }

  changeParkingSpace() {
    console.log('changeParkingSpace called');
  }

  confirmSpaceData() {
    console.log('confirmSpaceData called');
  }

  launchPage(page_name) {
    this.props.navigation.navigate('TagAction', {'page': page_name});
    this.dismissModal();
    
    if (page_name == 'drive') {

    } else if (page_name == 'fuel') {
      this.props.navigation.navigate('Fuel', this.props);
    } else if (page_name == 'camera') {

    } else if (page_name == 'note') {

    }
  }

  render() {
  	return (
      <View
        style={styles.tagModalOverlay}>

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
            <Text style={styles.stallHeader}>Stall {this.props.vehicleId}</Text>
          </View>

          <View
            style={styles.tagModalMainBody}>

            <Text style={styles.header}>
              {this.props.year} {this.props.make} {this.props.model}</Text>
            <Text style={styles.subtitle}>
              {this.props.vehicleId}</Text>

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
              style={styles.spaceUpdateContainer}>

              <TouchableOpacity
                style={buttonStyles.activeSecondaryModalButton}
                onPress={this.changeParkingSpace}>
                <Text style={buttonStyles.activeSecondaryTextColor}>
                  CHANGE
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

        </View>
      </View>
      
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
    fontSize: 20,
    fontWeight: '300',
    color: 'white',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '200',
    color: '#E6E4E0',
  },
  stallHeader: {
    fontSize: 19,
    fontWeight: '100',
    color: '#E6E4E0',
    borderTopWidth: 5,
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
    flexDirection: 'column',
    justifyContent: 'space-evenly',
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
  spaceUpdateContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  }
});
