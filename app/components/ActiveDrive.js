import React, { Component } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

export default class ActiveDrive extends Component {
  state = { loading: true, open: false, results: [] };
  UNSAFE_componentWillMount() {
    this.callActiveDrives();
  }
  componentDidUpdate() {
    if (this.props.refresh) {
      this.callActiveDrives();
    }
  }
  callActiveDrives() {
    //console.log('CALL ACTIVE DRIVES');
    let url = GlobalVariables.BASE_ROUTE + Route.ACTIVE_DRIVES;
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Bearer ' + GlobalVariables.LOTWING_ACCESS_TOKEN,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(result => {
        if (
          result.message &&
          result.message === GlobalVariables.AUTHORISATION_FAILED
        ) {
          console.log('Authentication Failed');
          this.props.navigation.navigate('Auth');
        }
        // remove charge events
        let finalEvents = [];
        result.data.forEach(event => {
          console.log('EVENT: ', event.event.id, '\nEvent Type: ', event.event.event_type)
          if (event.event.event_type !== GlobalVariables.BEGIN_CHARGING) {
            finalEvents.push(event);
          }
        });
        this.setState({
          loading: false,
          results: finalEvents,
        });
      });
  }
  renderText(vehicle, event_type) {
    let type = '';
    let year = '';
    let event = 'on a test drive';
    if (vehicle.usage_type === 'is_new') {
      type = 'New ';
    }
    if (vehicle.usage_type === 'is_used') {
      type = 'Used ';
    }
    if (vehicle.usage_type === 'loaner') {
      type = 'Loaner ';
    }
    if (vehicle.usage_type === 'wholesale_unit') {
      type = 'Trade/Wholesale ';
    }
    if (vehicle.usage_type === 'lease_return') {
      type = 'Lease Return ';
    }
    if (vehicle.year !== null) {
      year = `${vehicle.year} `;
    }

    if (event_type === 'fuel_vehicle') {
      event = 'being refuelled';
    }
    const text = `You have ${vehicle.stock_number} (${type}${year}${vehicle.model}) ${event} or waiting to be parked. Resolve now?`;
    return text;
  }
  render() {
    const { containerStyle, activeStyle, eventStyle } = styles;
    const { style } = this.props;
    if (this.state.loading) {
      return null;
    }
    if (this.state.results < 1) {
      return null;
    }
    if (this.state.open) {
      return (
        <ScrollView
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 20,
            elevation: 20,
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'absolute',
          }}>
          <View style={[{ padding: 20, paddingBottom: 50 }, style]}>
            {this.state.results.map(result => {
              const { vehicle } = result;
              const { started_at, id, summary, event_type } = result.event;
              return (
                <View style={{ marginBottom: 10 }}>
                  <View style={eventStyle}>
                    <Text style={{ fontSize: 14 }}>
                      {this.renderText(vehicle, event_type)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      onPress={() => {
                        this.setState({ open: false });
                        this.props.navigation.navigate(
                          event_type === 'test_drive' ? 'Drive' : 'Fuel',
                          {
                            space_id: null,
                            vehicles: [vehicle],
                            position: 0,
                            eventId: id,
                            started_at: started_at,
                            summary: summary,
                          },
                        );
                      }}
                      style={{ flex: 1 }}>
                      <View
                        style={{
                          padding: 10,
                          borderBottomLeftRadius: 10,
                          backgroundColor: '#000',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 1,
                        }}>
                        <Text
                          style={{
                            fontSize: 14,
                            color: '#FFF',
                          }}>
                          RESOLVE
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => this.setState({ open: false })}
                      style={{ flex: 1 }}>
                      <View
                        style={{
                          padding: 10,
                          borderBottomRightRadius: 10,
                          backgroundColor: '#000',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 1,
                        }}>
                        <Text
                          style={{
                            fontSize: 14,
                            color: '#FFF',
                          }}>
                          NOT NOW
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      );
    }
    return (
      <View style={[containerStyle, style]}>
        <TouchableOpacity onPress={() => this.setState({ open: true })}>
          <View style={activeStyle}>
            <Ionicons
              type="ionicon"
              name={'md-alert'}
              size={25}
              style={{ color: '#000', marginRight: 10 }}
            />
            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>
              ACTIVE DRIVE
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = {
  containerStyle: {
    position: 'absolute',
    top: 10,
    left: 15,
    zIndex: 20,
    elevation: 20,
    width: Dimensions.get('window').width - 100,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  activeStyle: {
    backgroundColor: '#FF9933',
    flexDirection: 'row',
    padding: 4,
    paddingLeft: 12,
    paddingRight: 12,
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 10,
    alignItems: 'center',
  },
  eventStyle: {
    width: '100%',
    backgroundColor: '#FF9933',
    padding: 12,
    paddingLeft: 20,
    paddingRight: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 2,
  },
};
