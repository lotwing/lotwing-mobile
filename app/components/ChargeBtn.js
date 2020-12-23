import React, { Component } from 'react';
import { TouchableOpacity, View, Image, Text, Alert } from 'react-native';
import buttonStyles from '../constants/ButtonStyles';
import Timer from './Timer';
import LotActionHelper from '../helpers/LotActionHelper';
import GlobalVariables from '../constants/GlobalVariables';

export default class ChargeBtn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chargeActive: this.props.event.started_at !== null,
      chargeTime: '0:01',
      vehicle: this.props.vehicle,
      spaceId: this.props.spaceId,
      eventId: this.props.event.event_id,
      startedAt: this.props.event.started_at,
      btnActive: true,
    };
  }
  // START CHARGE
  startCharge() {
    console.log(
      'Start Charge\nVEHICLE:',
      this.state.vehicle.stock_number,
      this.state.vehicle.year,
      this.state.vehicle.make,
      this.state.vehicle.model,
      '\nSPACE ID: ',
      this.state.spaceId,
    );
    this.setState({ btnActive: false });

    let payload = LotActionHelper.structureTagPayload(
      GlobalVariables.BEGIN_CHARGING,
      { vehicleId: this.state.vehicle.id, spaceId: this.state.spaceId },
      'Starting charge',
    );
    LotActionHelper.registerTagAction(payload)
      .then(responseJson => {
        if (responseJson && responseJson.event) {
          this.setState({ eventId: responseJson.event.id });
          this.startEvent(responseJson.event.id);
        } else {
          console.log('No event returned');
          this.setState({ btnActive: true });
        }
      })
      .catch(err => {
        console.log(
          '\nCAUGHT ERROR IN START CHARGING ACTION: \n',
          err,
          err.name,
        );
        this.setState({ btnActive: true });
        return err;
      });
  }
  startEvent(eventId) {
    console.log('Start Event\neventId: ', eventId);
    //let eventIdPromise = LotActionHelper.getEventId(this.details.spaceId, 'test_drive');
    const startPackage = {
      started_at: this.formatDate(Date.now()),
    };
    let eventIdPromise = LotActionHelper.endTimeboundTagAction(
      startPackage,
      eventId,
    );

    eventIdPromise.then(() => {
      this.setState({
        eventId: eventId,
        chargeActive: true,
        btnActive: true,
      });
    });
  }

  // STOP CHARGE
  stopCharge() {
    console.log('Stop Charge');
    this.setState({ btnActive: false });
    const endPackage = {
      ended_at: this.formatDate(Date.now()),
      acknowledged: true, // shouldAcknowledgeAction
      event_details:
        'Charged for ' +
        this.state.chargeTime +
        '. \nCharge ended by ' +
        GlobalVariables.USER_NAME,
    };
    let eventIdPromise = LotActionHelper.endTimeboundTagAction(
      endPackage,
      this.state.eventId,
    )
      .then(result => {
        this.setState({ chargeActive: false, btnActive: true });
      })
      .catch(err => {
        console.log('Event stop failed: ', err);
        this.setState({ btnActive: true });
      });
  }

  // CHARGE FUNCIONS
  setChargeTime = timeDisplayed => {
    this.setState({ chargeTime: timeDisplayed });
  };
  formatDate(date) {
    const d = new Date(date);
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const hours =
      d.getUTCHours() < 10 ? `0${d.getUTCHours()}` : `${d.getUTCHours()}`;
    const minutes =
      d.getUTCMinutes() < 10 ? `0${d.getUTCMinutes()}` : `${d.getUTCMinutes()}`;
    const seconds =
      d.getUTCSeconds() < 10 ? `0${d.getUTCSeconds()}` : `${d.getUTCSeconds()}`;
    return `${days[d.getUTCDay()]}, ${d.getUTCDate()} ${
      months[d.getUTCMonth()]
    } ${d.getUTCFullYear()} ${hours}:${minutes}:${seconds} +0000`;
  }

  showText() {
    let startTime = Date.now();
    if (this.state.startedAt !== null && this.state.startedAt !== undefined) {
      startTime = Date.parse(this.state.startedAt);
    }
    if (this.state.chargeActive) {
      return (
        <Timer startTime={startTime} fuelTime={this.setChargeTime} charger />
      );
    }
    return <Text style={buttonStyles.label}>Charge</Text>;
  }
  render() {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          if (this.state.btnActive) {
            this.state.chargeActive
              ? Alert.alert(
                  'End Charge Session?',
                  'Select Yes if ending charge.',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Yes',
                      onPress: () => this.stopCharge(),
                    },
                  ],
                  { cancelable: true },
                )
              : Alert.alert(
                  'Is vehicle in right stall?',
                  'If not correct stall perform CHANGE STALL first',
                  [
                    {
                      text: 'No',
                      style: 'cancel',
                    },
                    {
                      text: 'Yes',
                      onPress: () => this.startCharge(),
                    },
                  ],
                  { cancelable: true },
                );
          }
        }}
        style={{ width: 80, height: 50 }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Image
            source={
              this.state.chargeActive
                ? require('../../assets/images/charge-active.png')
                : require('../../assets/images/charge-inactive.png')
            }
            style={buttonStyles.icon}
            resizeMode={'contain'}
          />
          <View style={{ marginTop: 5 }}>{this.showText()}</View>
        </View>
      </TouchableOpacity>
    );
  }
}
