import React from 'react';
import {
  TextInput,
  View,
  Button,
} from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';


export default class LoginScreen extends React.Component {
  
  static navigationOptions = {
    title: 'LotWing Login',
  };

  constructor(props) {
    super(props);

    this.state = { text1: 'Email Address', text2: 'Password'};
  }

  render() {
    return (
      <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch',
      }}>

        <TextInput
          style={{height: 50, margin: 10, padding: 5, borderColor: 'gray', borderWidth: 1}}
          onChangeText={(text) => this.setState({text})}
          value={this.state.text1} />
      
        <TextInput
          style={{height: 50, margin: 10, padding: 5, borderColor: 'gray', borderWidth: 1}}
          onChangeText={(text) => this.setState({text})}
          value={this.state.text2} />

        <LoginButton callback={this.navigationCallback} navigation={this.props.navigation}/>
          
      </View>


    );
  }

}

class LoginButton extends React.Component {
  constructor(props) {
      super(props);
  }

  _attemptLogin() {
    // var email_in = 'aneigher@gmail.com'; // TODO(adwoa): retrieve text input from display
    // var pwd_in = 'front-3011-dev'; // TODO(adwoa): retrieve text input from display

    var email_in = 'adwoa@movementdash.com'; // TODO(adwoa): retrieve text input from display
    var pwd_in = 'lot-mobile-view'; // TODO(adwoa): retrieve text input from display

    let login_formdata = new FormData();
    login_formdata.append('email', email_in);
    login_formdata.append('password', pwd_in);

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
        <Button
          title="Login"
              onPress={() => this._attemptLogin()}
              color="#841584"> 
              Login 
          </Button>
      );
    }

}