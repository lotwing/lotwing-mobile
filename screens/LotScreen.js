import React from 'react';
import {
  Text,
  View,
} from 'react-native';

import LotView from '../components/LotView';

export default class LotScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  render() {
  	return (
  		<LotView>
  			<Text> Map View </Text>
  		</LotView>
  	);
  }
}