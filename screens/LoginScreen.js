import React from 'react';
import {
  TextInput,
  View,
} from 'react-native';

import LoginButton from '../components/Login';

export default class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { text1: 'Email Address', text2: 'Password' };
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

        <LoginButton />
          
      </View>


  	);
  }
}