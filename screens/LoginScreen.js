import React from 'react';
import {
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import buttonStyles from '../constants/ButtonStyles';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';


export default class LoginScreen extends React.Component {

  constructor(props) {
    super(props);

    this.state = { 
      email: 'Email Address', 
      pwd: 'Password', 
      buttonText: 'Login',
      debug_email: 'adwoa@movementdash.com', 
      debug_pwd: 'lot-mobile-view',
      debug_buttonText: 'Autologin',
    };
  }

  render() {
    return (
      <View style={styles.loginBackground}>
        
        <Image
          source={
            __DEV__
              ? require('../assets/images/lotwing-logo-white.png')
              : require('../assets/images/lotwing-logo-white.png')
          }
          style={styles.logoSizing}/>
        
        <View style={styles.inputContainer}>
          <TextInput
            autoCapitalize='none'
            style={{height: 50, margin: 10, padding: 5, borderColor: 'gray', borderWidth: 1, backgroundColor: 'white',}}
            onChangeText={(email) => this.setState({email})}
            keyboardType='email-address'
            placeholder={this.state.email} />
        
          <TextInput
            style={{height: 50, margin: 10, padding: 5, borderColor: 'gray', borderWidth: 1, backgroundColor: 'white',}}
            onChangeText={(pwd) => this.setState({pwd})}
            secureTextEntry={true}
            placeholder={this.state.pwd} />

        </View>

        <LoginButton 
          email={this.state.email}
          pwd={this.state.pwd}
          buttonText={this.state.buttonText}
          callback={this.navigationCallback} 
          navigation={this.props.navigation}
          style={[buttonStyles.activePrimaryModalButton, {marginLeft: 0, marginTop: 50, marginBottom: 20, width: '25%'}]}
          textColor={buttonStyles.activePrimaryTextColor}/>

        <LoginButton 
            email={this.state.debug_email}
            pwd={this.state.debug_pwd}
            buttonText={this.state.debug_buttonText}
            callback={this.navigationCallback} 
            navigation={this.props.navigation}
            textColor={buttonStyles.activeSecondaryTextColor}/>

      </View>
    );
  }

}

class LoginButton extends React.Component {
  constructor(props) {
      super(props);
  }

  _attemptLogin() {
    let login_formdata = new FormData();
    login_formdata.append('email', this.props.email);
    login_formdata.append('password', this.props.pwd);

    return fetch(GlobalVariables.BASE_ROUTE + Route.LOGIN , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: login_formdata,
      })
      .then((response) => response.json())
          .then((responseJson) => {
            if (responseJson.message == GlobalVariables.SUCCESSFUL_LOGIN) {
              GlobalVariables.LOTWING_ACCESS_TOKEN = responseJson.access_token;
              this.props.navigation.navigate('Lot');
            } else {
              // TODO(adwoa): display error message
              console.log('There was an error with login', responseJson);
            }
          });
    }

    render() {
      return (
        <TouchableOpacity
          style={this.props.style}
          onPress={() => this._attemptLogin()}>
          <Text style={this.props.textColor}>
            {this.props.buttonText}
          </Text>
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
    width: '50%',
  },
});

