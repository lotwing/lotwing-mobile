import React, { Component } from 'react';
import {
  View,
  ScrollView,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

import { getStatusBarHeight } from 'react-native-iphone-x-helper';

class VMScreen extends Component {
  state = { loading: true, vehicles_data: [], type: 'is_new' };

  componentWillMount() {
    this.loadVehicleData();
    //this.setState({loading: false})
  }
  componentWillReceiveProps(nextProps) {
    const { refresh } = nextProps.navigation.state.params;
    if (refresh) {
      this.loadVehicleData();
    }
  }
  loadVehicleData() {
    this.setState({ loading: true });
    let url = GlobalVariables.BASE_ROUTE + Route.VEHICLE;
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
        //console.log(result)
        this.setState({ loading: false, vehicles_data: result });
      });
  }
  count(type) {
    return this.state.vehicles_data.filter(
      vehicle => vehicle.usage_type === type,
    ).length;
  }

  render() {
    const { navigation } = this.props;
    const { t, h, pill } = styles;
    let models = [];
    const vehicles = this.state.vehicles_data.filter(
      vehicle => vehicle.usage_type === this.state.type,
    );
    vehicles.forEach(vehicle => {
      if (!models.includes(vehicle.model)) {
        models.push(vehicle.model);
      }
    });
    if (this.state.loading) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: '#FFF',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      );
    }
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#BE1E2D',
          paddingTop: getStatusBarHeight(),
        }}>
        <ScrollView style={{ flex: 1 }}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}>
            <TouchableOpacity onPress={() => navigation.navigate('Sales')}>
              <Image
                source={require('../../assets/images/menu-wing.png')}
                style={{
                  width: Dimensions.get('window').width / 4,
                  height: Dimensions.get('window').width / 4,
                }}
              />
            </TouchableOpacity>
          </View>
          <View style={{ padding: 20 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={[
                  { backgroundColor: '#006699' },
                  pill,
                  this.state.type === 'is_new' && { borderColor: '#BE1E2D' },
                ]}>
                <Text style={t}>New: {this.count('is_new')}</Text>
              </View>
              <View
                style={[
                  { backgroundColor: '#66CC00' },
                  pill,
                  this.state.type === 'is_used' && { borderColor: '#FFF' },
                ]}>
                <Text style={t}>Used: {this.count('is_used')}</Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={[
                  { backgroundColor: '#E8F051' },
                  pill,
                  this.state.type === 'loaner' && { borderColor: '#FFF' },
                ]}>
                <Text>Loaner: {this.count('loaner')}</Text>
              </View>
              <View
                style={[
                  { backgroundColor: '#8D8C88' },
                  pill,
                  this.state.type === 'wholesale_unit' && {
                    borderColor: '#FFF',
                  },
                ]}>
                <Text style={t}>Wholesale: {this.count('wholesale_unit')}</Text>
              </View>
              <View
                style={[
                  { backgroundColor: '#D13CEA' },
                  pill,
                  this.state.type === 'lease_return' && { borderColor: '#FFF' },
                ]}>
                <Text style={t}>
                  Lease Return: {this.count('lease_return')}
                </Text>
              </View>
            </View>
          </View>
          <View style={{ paddingLeft: 40, paddingRight: 40 }}>
            {models.map(model => {
              return (
                <View style={{ paddingBottom: 5 }}>
                  <Text style={t}>{`${model} (${
                    vehicles.filter(vehicle => vehicle.model === model).length
                  })`}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
        <View
          style={{
            flex: 0,
            flexDirection: 'row',
            padding: 10,
            alignItems: 'flex-end',
            position: 'absolute',
            right: 0,
            bottom: 0,
          }}>
          <TouchableOpacity onPress={() => this.loadVehicleData()}>
            <View
              style={{
                padding: 10,
                backgroundColor: '#000',
                borderRadius: 5,
                marginRight: 10,
              }}>
              <Text style={t}>Refresh</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = {
  h: {
    color: '#FFF',
    fontSize: 18,
  },
  t: {
    color: '#FFF',
  },
  pill: {
    borderRadius: 8,
    padding: 7,
    margin: 3,
    borderWidth: 2,
    borderColor: '#BE1E2D',
  },
};
export default VMScreen;
