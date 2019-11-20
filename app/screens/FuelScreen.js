import React from 'react';
import {
  AsyncStorage,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

import Timer from '../components/Timer';

import buttonStyles from '../constants/ButtonStyles';
import pageStyles from '../constants/PageStyles';
import textStyles from '../constants/TextStyles';

import LotActionHelper from '../helpers/LotActionHelper';

export default class FuelScreen extends React.Component {
  constructor(props) {
    super(props);
    this.details = this.props.navigation.state.params.props;
    this.vehicle = this.props.navigation.state.params.vehicles[
      this.props.navigation.state.params.position
    ];
    this.eventId = this.props.navigation.state.params.eventId;
    this.startedAt = this.props.navigation.state.params.started_at;
    this.summary = this.props.navigation.state.params.summary;

    //this.showSaveTagViews = this.showSaveTagViews.bind(this);
    //this.startOrStopAction = this.startOrStopAction.bind(this);

    //this.endFueling = this.endFueling.bind(this);

    //this.fuelEventId = null;

    this.state = {
      btnPressed: false,
      eventRunning: false,
      //isFuelActionVisible: true,
      //isStopButtonVisible: false,
      fuelTime: '0:01',
      eventId: 0,
      //startStopButtonText: 'START FUELING',
    };
  }
  componentDidMount() {
    console.log('Event ID: ', this.eventId);
    this.props.navigation.setParams({ extras: { showModalonExit: true } });
    if (this.eventId !== null && this.eventId !== undefined) {
      this.setState({ eventRunning: true, eventId: this.eventId });
    }
  }

  // create event tag and retrieve id
  startFuelingAction() {
    if (!this.state.btnPressed) {
      this.setState({ btnPressed: true });
      this.props.navigation.setParams({
        extras: {
          fuelEventId: this.eventId,
          spaceId: this.details.spaceId,
          showModalonExit: false,
        },
      });
      let payload = LotActionHelper.structureTagPayload(
        GlobalVariables.BEGIN_FUELING,
        { vehicleId: this.vehicle.id, spaceId: this.details.spaceId },
        'starting to fuel',
      );
      LotActionHelper.registerTagAction(payload)
        .then(responseJson => {
          if (responseJson) {
            this.eventId = responseJson.event ? responseJson.event.id : null;
            this.startEvent(this.eventId);
          }
        })
        .catch(err => {
          console.log(
            '\nCAUGHT ERROR IN START FUELLING ACTION: \n',
            err,
            err.name,
          );
          this.setState({ btnPressed: false });
          return err;
        });
    }
  }
  // send the started_at time to the server, and start animation
  startEvent(eventId) {
    //let eventIdPromise = LotActionHelper.getEventId(this.details.spaceId, 'test_drive');
    const startPackage = {
      started_at: this.formatDate(Date.now()),
    };
    //console.log('start package', startPackage)
    let eventIdPromise = LotActionHelper.endTimeboundTagAction(
      startPackage,
      eventId,
    );

    eventIdPromise.then(() => {
      this.setState({
        eventRunning: true,
        eventId: eventId,
        btnPressed: false,
      });
    });
  }

  endFueling(shouldAcknowledgeAction) {
    this.props.navigation.setParams({ extras: { updateLocation: true } });

    const endPackage = {
      ended_at: this.formatDate(Date.now()),
      acknowledged: true, // shouldAcknowledgeAction
      event_details:
        'Fuel event for ' +
        this.state.fuelTime +
        '. \nFuel event ended by ' +
        GlobalVariables.USER_NAME,
    };

    let eventIdPromise = LotActionHelper.endTimeboundTagAction(
      endPackage,
      this.eventId,
    ).then(() => {
      this.props.navigation.navigate('Lot', {
        extras: this.props.navigation.getParam('extras', {}),
        modalVisible: true,
        refresh: true,
        findingOnMap: false,
      });
    });
  }

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

  // helper function for timer
  setFuelTime = timeDisplayed => {
    this.setState({ fuelTime: timeDisplayed });
  };

  _renderTimerOnStart(startTime) {
    if (this.state.eventRunning) {
      return <Timer startTime={startTime} fuelTime={this.setFuelTime} />;
    }
    return <Text style={textStyles.timer}>00:00:00</Text>;
  }

  _renderProperFuelActionView() {
    let startTime = Date.now();
    if (this.startedAt !== null && this.startedAt !== undefined) {
      console.log(this.startedAt);
      startTime = Date.parse(this.startedAt);
    }
    return (
      <View style={{ flex: 7 }}>
        {this.state.eventRunning &&
          this.summary !== null &&
          this.summary !== undefined &&
          this.summary !== '' && (
            <View
              style={{
                flex: 0,
                padding: 14,
                paddingLeft: 30,
                paddingRight: 30,
              }}>
              <Text
                style={[textStyles.actionSummaryHeader, { color: '#828282' }]}>
                Started by:{' '}
                {this.summary.substring(
                  this.summary.indexOf('<strong>') + 9,
                  this.summary.indexOf('</strong>'),
                )}
              </Text>
            </View>
          )}
        <View
          style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
          {this._renderTimerOnStart(startTime)}
        </View>

        {this.state.eventRunning ? (
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              margin: 30,
            }}>
            {/*<TouchableOpacity
				  		style={[ buttonStyles.activePrimaryModalButton, { width: '90%', paddingTop: 15, paddingBottom: 15, marginLeft: 0 } ]}
				 			onPress={() => {
				 				Alert.alert(
  								'Cancel Fuelling',
								  'Cancel fuelling and choose a stall to populate?',
								  [
								    {
								      text: 'Cancel',
								      style: 'cancel',
								    },
								    {
								    	text: 'OK',
								    	onPress: () => this.endFueling(false)
								    },
								  ],
								  { cancelable: true },
								);
				 			}}>
				 			<Text style={[buttonStyles.activePrimaryTextColor, {fontWeight: '300', fontSize: 20}]}>
				 				CANCEL FUELLING
				 			</Text>
				 		</TouchableOpacity>*/}
            <TouchableOpacity
              style={[
                buttonStyles.activeSecondaryModalButton,
                {
                  width: '90%',
                  paddingTop: 15,
                  paddingBottom: 15,
                  marginTop: 30,
                },
              ]}
              onPress={() => {
                Alert.alert(
                  'End Fuelling',
                  'End fuelling and choose a stall to populate?',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'OK',
                      onPress: () => this.endFueling(true),
                    },
                  ],
                  { cancelable: true },
                );
              }}>
              <Text
                style={[
                  buttonStyles.activeSecondaryTextColor,
                  { fontWeight: '300', fontSize: 20 },
                ]}>
                END FUELLING
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              pageStyles.row,
              {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                margin: 30,
              },
            ]}>
            <TouchableOpacity
              style={[
                buttonStyles.activeSecondaryModalButton,
                { width: '90%', paddingTop: 15, paddingBottom: 15 },
              ]}
              onPress={() => this.startFuelingAction()}>
              <Text
                style={[
                  buttonStyles.activeSecondaryTextColor,
                  { fontWeight: '300', fontSize: 20 },
                ]}>
                START FUELLING
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  render() {
    return (
      <View
        style={[
          pageStyles.container,
          { justifyContent: 'flex-start', backgroundColor: '#E6E4E0' },
        ]}>
        <View
          style={[
            pageStyles.darkBody,
            pageStyles.row,
            { justifyContent: 'space-between' },
          ]}>
          <View style={[pageStyles.darkBody, pageStyles.column]}>
            <Text style={textStyles.header}>
              {this.vehicle.year} {this.vehicle.make} {this.vehicle.model}
            </Text>
            <Text style={textStyles.subtitle}>
              SKU {this.vehicle.stockNumber}
            </Text>
          </View>
          <View style={pageStyles.column}>
            <Image
              source={require('../../assets/images/fuel-white.png')}
              style={[buttonStyles.icon, { padding: 10, minWidth: 30 }]}
              resizeMode={'contain'}
            />
          </View>
        </View>

        {this._renderProperFuelActionView()}
      </View>
    );
  }
}
