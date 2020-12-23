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
  Dimensions,
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
    this.state = {
      parkingLotsOpen: false,
    };
    if (!this.props.feedbackText) {
      this.props.feedbackText = 'Choose the stall to populate...';
    }
    console.log('TEXT to display: ', this.props.feedbackText);
  }

  render() {
    return (
      <View style={styles.stallPopulationPrompt}>
        <Text style={styles.stallPopulationPromptText}>
          {this.props.feedbackText}{' '}
        </Text>
        {this.props.parkingLots && this.props.parkingLots.length > 1 && (
          <TouchableOpacity
            style={buttonStyles.activeSecondaryModalButton}
            onPress={() => {
              if (
                !this.state.parkingLotsOpen &&
                this.props.parkingLots.length === 2
              ) {
                let currentLotNum = 0;
                this.props.parkingLots.forEach((lot, index) => {
                  if (lot === this.currentLot) {
                    currentLotNum = index;
                  }
                });
                let nextLotNum = currentLotNum + 1;
                if (nextLotNum >= this.props.parkingLots.length) {
                  nextLotNum = 0;
                }
                this.props.changeStall(nextLotNum);
              } else if (this.state.parkingLotsOpen) {
                this.setState({ parkingLotsOpen: false });
              } else {
                this.setState({ parkingLotsOpen: true });
              }
            }}>
            <Text style={buttonStyles.activeSecondaryTextColor}>
              SWITCH LOT
            </Text>
          </TouchableOpacity>
        )}
        {this.state.parkingLotsOpen && (
          <View
            style={{
              position: 'absolute',
              bottom: '100%',
              right: 0,
              marginBottom: 28,
              marginRight: 14,
            }}>
            {this.props.parkingLots.map((lot, index) => {
              return (
                <View key={index} style={{ marginBottom: 7 }}>
                  <TouchableOpacity
                    style={[
                      buttonStyles.activeSecondaryModalButton,
                      lot === this.props.currentLot && {
                        backgroundColor: '#444',
                      },
                    ]}
                    onPress={() => {
                      if (lot === this.props.currentLot) {
                        this.setState({ parkingLotsOpen: false });
                      } else {
                        this.props.changeStall(index);
                      }
                    }}>
                    <Text style={buttonStyles.activeSecondaryTextColor}>
                      {lot.name.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </View>
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
  },
  stallPopulationPrompt: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '10%',
    backgroundColor: '#828282',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
});
