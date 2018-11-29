import React from 'react';
import {
  TextInput,
  View,
} from 'react-native';

export default class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { text1: 'Email Address', text2: 'Password' };
  }

  render() {
  	return (
      <View>
        <TextInput
          style={{height: 50, margin: 10, padding: 5, borderColor: 'gray', borderWidth: 1}}
          onChangeText={(text) => this.setState({text})}
          value={this.state.text1}
        />
      </View>

      <View>
        <TextInput
          style={{height: 50, margin: 10, padding: 5, borderColor: 'gray', borderWidth: 1}}
          onChangeText={(text) => this.setState({text})}
          value={this.state.text2}
        />
      </View>

      <Button> Login </Button>

  	);
  }
}