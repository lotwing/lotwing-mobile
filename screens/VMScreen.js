import React, { Component } from 'react';
import { View, ScrollView, Text, Dimensions, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Constants } from 'expo';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';


class VMScreen extends Component {
  state = { loading: true, vehicles_data: [] }

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
    let url = GlobalVariables.BASE_ROUTE + Route.VEHICLE;
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer '+ GlobalVariables.LOTWING_ACCESS_TOKEN,
      },
    })
    .then((response) => {
        return response.json();
    })
    .then((result) => {
      //console.log(result)
      this.setState({loading: false, vehicles_data: result })
    })
  }
  count(type) {
    return this.state.vehicles_data.filter(vehicle => vehicle.usage_type === type).length
  }

  render() {
    const { navigation } = this.props;
    const { t, h } = styles;
    let models = [];
    const newVehicles = this.state.vehicles_data.filter(vehicle => vehicle.usage_type === 'is_new')
    newVehicles.forEach((vehicle) => {
      if (!models.includes(vehicle.model)) {
        models.push(vehicle.model)
      }
    })
    if (this.state.loading) {
      return(
        <View style={{ flex: 1, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size='large' color='#000' />
        </View>
      );
    }
    return(
      <View style={{ flex: 1, backgroundColor: '#BE1E2D', paddingTop: Constants.statusBarHeight}}>
        <ScrollView style={{ flex: 1 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <TouchableOpacity onPress={()=> navigation.navigate('Sales')}>
              <Image
                source={ require('../assets/images/menu-wing.png') }
                style={{ width: Dimensions.get('window').width/4, height: Dimensions.get('window').width/4 }}
              />
            </TouchableOpacity>
          </View>
          <View style={{ padding: 20}}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              { this.count('is_new') > 0 &&
                <View style={{ backgroundColor: '#006699', borderRadius: 5, padding: 5, margin: 3 }}>
                  <Text style={ t }>New: { this.count('is_new') }</Text>
                </View>
              }
              { this.count('is_used') > 0 &&
                <View style={{ backgroundColor: '#66CC00', borderRadius: 5, padding: 5, margin: 3 }}>
                  <Text style={ t }>Used: { this.count('is_used') }</Text>
                </View>
              }
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              { this.count('loaner') > 0 &&
                <View style={{ backgroundColor: '#E8F051', borderRadius: 5, padding: 5, margin: 3 }}>
                  <Text>Loaner: { this.count('loaner') }</Text>
                </View>
              }
              { this.count('wholesale_unit') > 0 &&
                <View style={{ backgroundColor: '#8D8C88', borderRadius: 5, padding: 5, margin: 3 }}>
                  <Text style={ t }>Wholesale: { this.count('wholesale_unit') }</Text>
                </View>
              }
              { this.count('lease_return') > 0 &&
                <View style={{ backgroundColor: '#D13CEA', borderRadius: 5, padding: 5, margin: 3 }}>
                  <Text style={ t }>Lease Return: { this.count('lease_return') }</Text>
                </View>
              }
            </View>
          </View>
          <View style={{ paddingLeft: 40, paddingRight: 40 }}>
          {
            models.map((model) => {
              return(
                <View style={{ paddingBottom: 5 }}>
                  <Text style={t}>{`${ model } (${ newVehicles.filter(vehicle => vehicle.model === model).length })`}</Text>
                </View>
              );
            })
          }
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = {
  h: {
    color: '#FFF',
    fontSize: 18
  },
  t: {
    color: '#FFF'
  }
}
export default VMScreen;