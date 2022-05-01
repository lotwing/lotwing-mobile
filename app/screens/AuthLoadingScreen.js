import React, { useState, useEffect } from 'react';
import { Image, StatusBar, StyleSheet, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from '@react-native-community/netinfo';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

const AuthLoadingScreen = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const netInfo = useNetInfo();

  useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const _bootstrapAsync = async () => {
      const userToken = await AsyncStorage.getItem('userToken');
      GlobalVariables.LOTWING_ACCESS_TOKEN = userToken;

      if (userToken) {
        console.log('\n\nASYNC User Token: ', userToken);
        setMessage('Local user found, fetching authorization');
        return fetch(GlobalVariables.BASE_ROUTE + Route.AUTH_CHECK, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Bearer ' + userToken,
          },
        })
          .then(response => {
            return response.json();
          })
          .then(responseJson => {
            // This will switch to the App or Auth screen and this loading
            // screen will be unmounted and thrown away.
            console.log('AUTH CHECK RESPONSE:', responseJson);
            GlobalVariables.USER_NAME =
              responseJson.message === 'Correct Authentication'
                ? responseJson.user_info.full_name
                : '';
            GlobalVariables.USER_NAME !== '' &&
              setMessage(
                `Login successful. Welcome ${GlobalVariables.USER_NAME}`,
              );
            return responseJson;
          });
      } else {
        setMessage('Authorization failed. Please log in again.');
        console.log('NO USER TOKEN IN ASYNC STORAGE');
        navigation.navigate('Auth');
      }
    };

    let authResponse = _bootstrapAsync();
    authResponse.then(responseJson => {
      if (responseJson && responseJson.message === 'Correct Authentication') {
        console.log('Navigate to App');
        navigation.navigate('App');
      } else {
        console.log('Navigate to Auth');
        setMessage('Authorization failed. Please log in again.');
        AsyncStorage.clear();
        navigation.navigate('Auth');
      }
    });
  }, [navigation]);

  return (
    <View style={styles.loginBackground}>
      <StatusBar barStyle="light-content" backgroundColor="#BE1E2D" />
      <Image
        source={require('../../assets/images/lotwing-logo-white.png')}
        style={styles.logoSizing}
      />
      {(netInfo.isConnected !== true || message !== '') && (
        <View style={styles.warningContainerStyle}>
          {netInfo.isConnected !== true && (
            <Text
              style={[
                { color: '#FFF' },
                message !== '' && { marginBottom: 10 },
              ]}>
              Please connect to the internet and try again.
            </Text>
          )}
          {message !== '' && <Text style={{ color: '#FFF' }}>{message}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loginBackground: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#BE1E2D',
    padding: 30,
  },
  logoSizing: {
    width: 235,
    resizeMode: 'contain',
  },
  warningContainerStyle: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 20,
  },
});

export default AuthLoadingScreen;
