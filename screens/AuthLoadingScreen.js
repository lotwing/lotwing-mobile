import React from 'react';
import {
  AsyncStorage,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

export default class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    let authResponse = this._bootstrapAsync();
    authResponse.then((responseJson) => {
      if (responseJson && responseJson.message == 'Correct Authentication') {
        console.log('Navigate to App');
        this.props.navigation.navigate('App');
      } else {
        console.log('Navigate to Auth');
        AsyncStorage.clear();
        this.props.navigation.navigate('Auth');
      }
    });
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem('userToken');
    GlobalVariables.LOTWING_ACCESS_TOKEN = userToken;

    if (userToken) {
      console.log('\n\nASYNC User Token: ', userToken);
      return fetch(GlobalVariables.BASE_ROUTE + Route.AUTH_CHECK , {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer '+ userToken,
          },
      })
      .then((response) => {
        return response.json()
      })
      .then((responseJson) => {
        // This will switch to the App or Auth screen and this loading
        // screen will be unmounted and thrown away.
        console.log('AUTH CHECK RESPONSE:', responseJson);
        return responseJson
      })
    } else {
      console.log('NO USER TOKEN IN ASYNC STORAGE');
      this.props.navigation.navigate('Auth');
    }
  };

  // Render any loading content that you like here
  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle='light-content'
          backgroundColor='#BE1E2D'/>
        <Image
          source={
            require('../assets/images/splash.png')
          }
          style={styles.container}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
});