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
    title: 'Lotwing Login',
  };

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
      <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch',
      }}>

        <TextInput
          autoCapitalize='none'
          style={{height: 50, margin: 10, padding: 5, borderColor: 'gray', borderWidth: 1}}
          onChangeText={(email) => this.setState({email})}
          keyboardType='email-address'
          placeholder={this.state.email} />
      
        <TextInput
          style={{height: 50, margin: 10, padding: 5, borderColor: 'gray', borderWidth: 1}}
          onChangeText={(pwd) => this.setState({pwd})}
          secureTextEntry={true}
          placeholder={this.state.pwd} />

        <LoginButton 
          email={this.state.email}
          pwd={this.state.pwd}
          buttonText={this.state.buttonText}
          callback={this.navigationCallback} 
          navigation={this.props.navigation}
          style={{
            color:"#841584",}}/>

        <LoginButton 
          email={this.state.debug_email}
          pwd={this.state.debug_pwd}
          buttonText={this.state.debug_buttonText}
          callback={this.navigationCallback} 
          navigation={this.props.navigation}
          style={{
            borderRadius: 3, 
            backgroundColor: 'blue', 
            textSize: '10pt',}}/>
          
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
        <Button
          title={this.props.buttonText}
          onPress={() => this._attemptLogin()}
          style={this.props.style}/>
      );
    }

}