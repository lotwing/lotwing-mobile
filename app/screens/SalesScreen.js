import React, { Component } from 'react';
import {
  View,
  ScrollView,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  AsyncStorage,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';

import ActiveDrive from '../components/ActiveDrive';
import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';
import * as pkg from '../../package.json';

class SalesScreen extends Component {
  state = {
    loading: true,
    mtd_data: [],
    today_data: [],
    dealership_data: [],
    users: [],
  };

  componentDidMount() {
    this.loadSalesData();
    //this.setState({loading: false})
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.navigation.state.params !== prevProps.navigation.state.params
    ) {
      if (this.props.navigation.state.params.refresh === true) {
        this.loadSalesData();
      }
    }
  }
  loadSalesData() {
    this.setState({ loading: true });
    let url = GlobalVariables.BASE_ROUTE + Route.SALES + 'mtd/';
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
        this.loadTodayData(result);
      });
  }

  loadTodayData(mtd_data) {
    let url = GlobalVariables.BASE_ROUTE + Route.SALES + 'today/';
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
        this.loadDealershipData(mtd_data, result);
      });
  }

  loadDealershipData(mtd_data, today_data) {
    let url = GlobalVariables.BASE_ROUTE + Route.DEALERSHIP;
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
        console.log('DEALERSHIP RESULT:', result);
        this.setState({
          loading: false,
          mtd_data: mtd_data.filter(s => s.stored === false),
          today_data: today_data.filter(s => s.stored === false),
          dealership_data: result.dealership,
          users: result.users,
        });
      });
  }

  toCamelCase(string) {
    return (
      string &&
      string
        .replace(/\b(\w)/g, function (match, capture) {
          return capture.toUpperCase();
        })
        .replace(/\s+/g, ' ')
    );
  }

  logOut() {
    const { navigation } = this.props;
    GlobalVariables.LOTWING_ACCESS_TOKEN = '';
    //AsyncStorage.setItem('userToken', '');
    navigation.navigate('Auth');
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
    return `${days[d.getUTCDay()]}, ${d.getUTCDate()} ${months[d.getUTCMonth()]
      } ${d.getUTCFullYear()} ${hours}:${minutes}:${seconds} +0000`;
  }

  render() {
    const { navigation } = this.props;
    const { params } = navigation.state;
    const { row, cell, t, h } = styles;
    let reps = [];
    let mtd_new = [];
    let mtd_used = [];
    this.state.mtd_data.forEach(sale => {
      if (!reps.some(rep => rep.id === sale.sales_rep_id)) {
        reps.push({
          id: sale.sales_rep_id,
          newSales: 0,
          usedSales: 0,
          totalSales: 0,
        });
      }
      if (
        !reps.some(rep => rep.id === sale.split_rep_id) &&
        sale.split_rep_id !== null
      ) {
        reps.push({
          id: sale.split_rep_id,
          newSales: 0,
          usedSales: 0,
          totalSales: 0,
        });
      }
      if (sale.is_used) {
        mtd_used.push(sale);
      }
      if (!sale.is_used) {
        mtd_new.push(sale);
      }
    });
    reps.forEach(rep => {
      let usedSales = 0;
      let newSales = 0;
      mtd_used.forEach(sale => {
        if (sale.sales_rep_id === rep.id) {
          if (sale.split_rep_id === null) {
            usedSales += 1;
          } else {
            usedSales += 0.5;
          }
        } else if (sale.split_rep_id === rep.id) {
          usedSales += 0.5;
        }
      });
      mtd_new.forEach(sale => {
        if (sale.sales_rep_id === rep.id) {
          if (sale.split_rep_id === null) {
            newSales += 1;
          } else {
            newSales += 0.5;
          }
        } else if (sale.split_rep_id === rep.id) {
          newSales += 0.5;
        }
      });
      rep.newSales = newSales;
      rep.usedSales = usedSales;
      rep.totalSales = newSales + usedSales;
    });
    reps.sort((a, b) => b.totalSales - a.totalSales);
    //console.log('REPS: ', reps)

    let models = [];
    const vehicles = mtd_new.filter(
      vehicle => vehicle.usage_type === this.state.type,
    );
    mtd_new.forEach(sale => {
      if (!models.some(model => model.name === sale.model)) {
        models.push({
          name: sale.model,
          total: mtd_new.filter(saleTotal => saleTotal.model === sale.model)
            .length,
        });
      }
    });

    models.sort((a, b) => b.total - a.total);
    console.log('SALES', this.state.today_data);
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
          paddingTop: getStatusBarHeight(true),
        }}>
        <ActiveDrive
          navigation={this.props.navigation}
          style={{ marginTop: getStatusBarHeight(true) }}
        />
        <ScrollView style={{ flex: 1 }}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              position: 'relative',
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
            <View style={{ position: 'absolute', right: 10, top: 5 }}>
              <Text style={{ fontSize: 12, color: '#FFFFFF' }}>
                {/*v{pkg.version}*/}
              </Text>
            </View>
          </View>
          <View style={{ padding: 20 }}>
            <View style={row}>
              <View style={cell} />
              <View style={cell}>
                <Text style={h}>Today</Text>
              </View>
              <View style={[cell, { flex: 0 }]}>
                <Text style={h}>MTD</Text>
              </View>
            </View>
            <View
              style={[
                row,
                { borderBottomWidth: 1, borderBottomColor: '#FFF' },
              ]}>
              <View style={cell}>
                <Text style={h}>New Sold</Text>
              </View>
              <View style={cell}>
                <Text style={h}>
                  {
                    this.state.today_data.filter(vehicle => !vehicle.is_used)
                      .length
                  }
                </Text>
              </View>
              <View style={[cell, { flex: 0 }]}>
                <View
                  style={{
                    backgroundColor: '#000',
                    padding: 5,
                    borderRadius: 5,
                  }}>
                  <Text style={h}>
                    {
                      this.state.mtd_data.filter(vehicle => !vehicle.is_used)
                        .length
                    }
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={[
                row,
                { borderBottomWidth: 1, borderBottomColor: '#FFF' },
              ]}>
              <View style={cell}>
                <Text style={h}>Used Sold</Text>
              </View>
              <View style={cell}>
                <Text style={h}>
                  {
                    this.state.today_data.filter(vehicle => vehicle.is_used)
                      .length
                  }
                </Text>
              </View>
              <View style={[cell, { flex: 0 }]}>
                <View
                  style={{
                    backgroundColor: '#000',
                    padding: 5,
                    borderRadius: 5,
                  }}>
                  <Text style={h}>
                    {
                      this.state.mtd_data.filter(vehicle => vehicle.is_used)
                        .length
                    }
                  </Text>
                </View>
              </View>
            </View>
            <View style={{ paddingTop: 10 }}>
              <Text style={[t, { fontStyle: 'italic' }]}>
                New start date:{' '}
                {this.state.dealership_data.custom_mtd_start_date}
              </Text>
            </View>
          </View>
          <View style={{ padding: 20 }}>
            <Text style={h}>Reps</Text>
            {reps.map(rep => {
              const user = this.state.users.find(user => user.id === rep.id);
              console.log('USER: ', user);
              return (
                <View style={row}>
                  <View style={[cell, { flex: 2 }]}>
                    <Text style={t}>{this.toCamelCase(user.full_name)}</Text>
                  </View>
                  <View style={cell}>
                    <Text style={t}>{rep.newSales} New</Text>
                  </View>
                  <View style={cell}>
                    <Text style={t}>{rep.usedSales} Used</Text>
                  </View>
                </View>
              );
            })}
          </View>
          <View style={{ padding: 20 }}>
            <Text style={h}>New by Model</Text>
            {models.map(model => {
              return (
                <View style={row}>
                  <Text style={t}>{`${model.name} (${model.total})`}</Text>
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
          <TouchableOpacity onPress={() => this.loadSalesData()}>
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
          <TouchableOpacity onPress={() => this.logOut()}>
            <View
              style={{ padding: 10, backgroundColor: '#000', borderRadius: 5 }}>
              <Text style={t}>Log out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = {
  row: {
    flexDirection: 'row',
    flex: 1,
    paddingTop: 5,
    paddingBottom: 5,
  },
  cell: {
    flex: 1,
    justifyContent: 'center',
  },
  h: {
    color: '#FFF',
    fontSize: 18,
  },
  t: {
    color: '#FFF',
  },
};
export default SalesScreen;
