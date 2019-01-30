import React from 'react';
import {
  View,
  Text,
  Button,
  Platform,
  StyleSheet,
  ActionSheetIOS,
  TouchableWithoutFeedback,
} from 'react-native';

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
          
        <View
          style={styles.tagModalStallBar}>
          <Text style={styles.stallHeader}>Stall {this.props.vehicleId}</Text>
        </View>

        <View
          style={styles.tagModalInnerView}>

          <Text style={styles.header}>
            {this.props.year} {this.props.make} {this.props.model}</Text>
          <Text style={styles.subtitle}>
            {this.props.vehicleId}</Text>

          <Button
            title='Test Drive'
            onPress={() => console.log('\nTest drive')}/>
          <Button
            title='Fuel Vehicle'
            onPress={() => console.log('\nFuel Vehicle')}/>
          <Button
            title='Update Tag'
            onPress={() => console.log('\nUpdate Tag')}/>

        </View>

      </View>
      
  	);
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
  tagModalInnerView: {
    flexDirection: 'column',
    backgroundColor: '#828282',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    borderWidth: 14,
    borderColor: '#828282',
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
  }
});