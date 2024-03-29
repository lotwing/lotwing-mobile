import React from 'react';

import { Platform, StatusBar, StyleSheet, View } from 'react-native';
// import { AppLoading, Asset, Font, Icon } from "expo";
import GlobalVariables from './app/constants/GlobalVariables';

import ErrorBoundary from './app/components/ErrorBoundary';
import AppNavigator from './app/navigation/AppNavigator';
import Mapbox from '@react-native-mapbox-gl/maps';

import { getStatusBarHeight } from 'react-native-iphone-x-helper';

Mapbox.setAccessToken(GlobalVariables.MAPBOX_ACCESSTOKEN);

export default class App extends React.Component {
  state = {
    isLoadingComplete: true,
  };

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        // <AppLoading
        //   startAsync={this._loadResourcesAsync}
        //   onError={this._handleLoadingError}
        //   onFinish={this._handleFinishLoading}
        // />
        <View />
      );
    }
    return (
      <ErrorBoundary>
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <AppNavigator />
        </View>
      </ErrorBoundary>
    );
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      // Asset.loadAsync([require("./assets/images/lotwing-logo-white.png")]),
      // Font.loadAsync({
      //   // This is the font that we are using for our tab bar
      //   ...Icon.Ionicons.font,
      //   // We include SpaceMono because we use it in HomeScreen.js. Feel free
      //   // to remove this if you are not using it in your app
      //   "space-mono": require("./assets/fonts/SpaceMono-Regular.ttf")
      // })
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BE1E2D',
    paddingTop: getStatusBarHeight(),
  },
});
