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
        style={this.props.style}
        onPress={() => {console.log('TOUCHING --INNER-- VIEW')}}>

        <Text>{this.props.vehicleId}</Text>
        <Text>{this.props.make} {this.props.model}</Text>
        <Text>{this.props.year}</Text>

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
    // Probably only needed on empty spaces
  }
}