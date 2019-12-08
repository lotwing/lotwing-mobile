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
} from 'react-native';

import buttonStyles from '../constants/ButtonStyles';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

import Mapbox from '@react-native-mapbox-gl/maps';

import pageStyles from '../constants/PageStyles';
import textStyles from '../constants/TextStyles';

/**
 *
 * Lot shapes include:
 * parking_lots, buildings, parking_spaces
 */
export default class ClickToPopulateViewHandler extends React.Component {
  constructor(props) {
    super(props);

    if (!this.props.feedbackText) {
      this.props.feedbackText = 'Choose the stall to populate...';
    }
    console.log('TEXT to display: ', this.props.feedbackText);
  }

  render() {
    return (
      <TouchableOpacity style={styles.stallPopulationPrompt}>
        <Text style={styles.stallPopulationPromptText}>
          {this.props.feedbackText}{' '}
        </Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
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
  stallPopulationPromptText: {
    fontSize: 20,
    fontWeight: '300',
    color: 'white',
    width: '100%',
  },
  stallPopulationPrompt: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '10%',
    backgroundColor: '#828282',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderWidth: 14,
    borderColor: '#828282',
  },
});
