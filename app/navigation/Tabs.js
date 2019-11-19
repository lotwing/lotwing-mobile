import React, { Component } from 'react'
import { View, TouchableOpacity, Text, Linking } from 'react-native';


// Navigation Layout
class Tabs extends Component {

  render() {
    const { navigate, state } = this.props.navigation;
    const { index } = state;
    const { tabStyle } = styles
    return (
        <View style={{ flexDirection: 'row', shadowOffset:{ width: 0, height: 5, }, shadowColor: '#000', shadowOpacity: 0.1, zIndex: 1, backgroundColor: '#000', height: 50 }}>
          { state.routes.map((route, key ) => {
            //console.log(route)
            return(
              <TouchableOpacity onPress={() => navigate(route.key) } style={[tabStyle, index === key && {backgroundColor: '#66CC00' }]}>
                <View>
                  <Text style={{ textAlign: 'center', color: '#FFF' }}>
                    { route.params !== undefined && route.params.tabBarLabel !== undefined ? route.params.tabBarLabel.toUpperCase() : route.routeName.toUpperCase() }
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity onPress={() => Linking.openURL('https://app.lotwing.com') } style={ tabStyle }>
            <View>
              <Text style={{ textAlign: 'center', color: '#FFF' }}>WEB APP</Text>
            </View>
          </TouchableOpacity>
        </View>
    );
  }
}

const styles = {
  tabStyle: {
    flex: 1,
    margin: 2,
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center'
  }
}
export default Tabs;