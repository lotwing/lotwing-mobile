import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

export default class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this._bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem('userToken');

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
        // console.log('AUTH CHECK RESPONSE:', response);
        return this.props.navigation.navigate('Auth'); // TODO(adwoa): update this when auth check api call works
        //return response.json()
      })
          // .then((responseJson) => {
          //   // This will switch to the App or Auth screen and this loading
          //   // screen will be unmounted and thrown away.
          //   if (responseJson.message == 'Correct Authentication') {
          //     this.props.navigation.navigate('App');
          //   } else {
          //     this.props.navigation.navigate('Auth');
          //   }
          // })
    }

    console.log('NO USER TOKEN IN ASYNC STORAGE');
    this.props.navigation.navigate('Auth');

  };

  // Render any loading content that you like here
  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
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