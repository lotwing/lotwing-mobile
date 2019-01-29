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
  
  render() {
  	return (
  		<TouchableWithoutFeedback 
        style={styles.tagModalOverlay}
        onPress={() => {
          console.log('TOUCHING --OUTER-- VIEW');
        }}>
        <View>
          <View
            style={styles.tagModalStallBar}>
            <Text style={styles.header}>Stall {this.props.vehicleId}</Text>
          </View>

          <View
            style={styles.tagModalInnerView}>
            <Text style={styles.header}>
              {this.props.year} {this.props.make} {this.props.model}</Text>
            <Text style={styles.subtitle}>
              {this.props.vehicleId}</Text>

            <View>
              <Text>navigation/MainTabNavigator.js</Text>
            </View>

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
      </TouchableWithoutFeedback>
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
  tagModalOverlay: {
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    backgroundColor: 'red',
  },
  tagModalInnerView: {
    flexDirection: 'column',
    backgroundColor: '#828282',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  tagModalStallBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: 'white',
    borderBottomColor: 'white',
    backgroundColor: '#828282',
  }
});