import React from 'react';
import {
  View,
  Text,
  Button,
  Platform,
  StyleSheet,
  ActionSheetIOS,
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
  
  render() {
  	return (
  		<View 
        style={styles.tagModalInnerView}
        onPress={() => {console.log('TOUCHING --INNER-- VIEW')}}>

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
    color: '#B5B5B5',
  },
  tagModalInnerView: {
    width: '100%',
    height: '30%',
    flexDirection: 'column',
    backgroundColor: '#828282',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});