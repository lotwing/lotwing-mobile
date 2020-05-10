import React from 'react';
import {
  Alert,
  AsyncStorage,
  Button,
  Platform,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from 'react-native';

import buttonStyles from '../constants/ButtonStyles';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

export default class LoginScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      email: '',
      pwd: '',
      buttonText: 'Login',
      //debug_email: 'adwoa@movementdash.com',
      //debug_pwd: 'lot-mobile-view',

      debug_email: 'damien@damienmason.com',
      debug_pwd: '5ngML5DI3mZq',
      debug_buttonText: 'Autologin',
    };
  }

  render() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{ flex: 1 }}
        enabled>
        <View style={styles.loginBackground}>
          <StatusBar barStyle="light-content" backgroundColor="#BE1E2D" />
          <Image
            source={
              __DEV__
                ? require('../../assets/images/lotwing-logo-white.png')
                : require('../../assets/images/lotwing-logo-white.png')
            }
            style={styles.logoSizing}
          />

          <View style={styles.inputContainer}>
            <TextInput
              autoCapitalize="none"
              style={{
                height: 50,
                margin: 10,
                padding: 5,
                borderColor: 'gray',
                borderWidth: 1,
                backgroundColor: 'white',
                color: 'black',
              }}
              onChangeText={email => this.setState({ email })}
              keyboardType="email-address"
              placeholder="Email Address"
              placeholderTextColor={'rgba(0,0,0,0.5)'}
            />

            <TextInput
              autoCapitalize="none"
              style={{
                height: 50,
                margin: 10,
                padding: 5,
                borderColor: 'gray',
                borderWidth: 1,
                backgroundColor: 'white',
                color: 'black',
              }}
              onChangeText={pwd => this.setState({ pwd })}
              secureTextEntry={true}
              placeholder="Password"
              placeholderTextColor={'rgba(0,0,0,0.5)'}
            />
          </View>

          <LoginButton
            email={this.state.email}
            pwd={this.state.pwd}
            buttonText={this.state.buttonText}
            callback={this.navigationCallback}
            navigation={this.props.navigation}
            style={[
              buttonStyles.activePrimaryModalButton,
              { marginLeft: 0, marginTop: 50, marginBottom: 20, width: '25%' },
            ]}
            textColor={buttonStyles.activePrimaryTextColor}
          />

          {/*<LoginButton
              email={this.state.debug_email}
              pwd={this.state.debug_pwd}
              buttonText={this.state.debug_buttonText}
              callback={this.navigationCallback}
              navigation={this.props.navigation}
              textColor={buttonStyles.activeSecondaryTextColor}/>
  */}
        </View>
      </KeyboardAvoidingView>
    );
  }
}

class LoginButton extends React.Component {
  constructor(props) {
    super(props);
  }

  async _attemptLogin() {
    let login_formdata = new FormData();
    login_formdata.append('email', this.props.email);
    login_formdata.append('password', this.props.pwd);
    try {
      const response = await fetch(GlobalVariables.BASE_ROUTE + Route.LOGIN, {
        method: 'POST',
        // Posting FormData should automatically set the headers - this breaks android
        // headers: {
        //   'Content-Type': 'application/x-www-form-urlencoded',
        // },
        body: login_formdata,
      });
      if (!response.ok) {
        throw response;
      }
      const responseJson = await response.json();
      if (responseJson.message == GlobalVariables.SUCCESSFUL_LOGIN) {
        GlobalVariables.LOTWING_ACCESS_TOKEN = responseJson.access_token;
        GlobalVariables.USER_NAME = responseJson.user_info.full_name;
        console.log(
          '\nLOT ACCESS TOKEN: ',
          GlobalVariables.LOTWING_ACCESS_TOKEN,
          '\n',
        );
        AsyncStorage.setItem(
          'userToken',
          '' + GlobalVariables.LOTWING_ACCESS_TOKEN,
        );

        this.props.navigation.navigate('App', { user: this.props.email });
      } else {
        // TODO(adwoa): display error message
        console.log('There was an error with login', responseJson);
      }
    } catch (err) {
      console.log(err);
      if (err instanceof Error) {
        Alert.alert(
          `An Error has occurred`,
          `
            Error: ${err.name} ${err.message}
          `,
          [
            {
              text: 'OK',
            },
          ],
        );
        console.error(err.message);
      } else if (err.statusText) {
        Alert.alert(
          `An Error has occurred`,
          `
            Error: ${err.statusCode} ${err.statusText}
          `,
          [
            {
              text: 'OK',
            },
          ],
        );
        console.error(err.statusText);
      }
    }
  }

  render() {
    return (
      <TouchableOpacity
        style={this.props.style}
        onPress={() => this._attemptLogin()}>
        <Text style={this.props.textColor}>{this.props.buttonText}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  loginBackground: {
    flex: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#BE1E2D',
  },
  logoSizing: {
    width: 235,
    resizeMode: 'contain',
  },
  inputContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    width: 260,
  },
});
