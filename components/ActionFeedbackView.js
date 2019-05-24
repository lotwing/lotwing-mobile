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
export default class ActionFeedbackView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TouchableOpacity
        style={styles.stallPopulationPrompt}>
        <Text
          style={styles.stallPopulationPromptText}>
          {this.props.feedbackText} </Text>
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
    width: '100%'
  },
  stallPopulationPrompt: {
    position:'absolute',
    bottom: 0,
    width: '100%', 
    height: '10%',
    backgroundColor: '#828282', 
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderWidth: 14,
    borderColor: '#828282',
  }
});
