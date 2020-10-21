import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { Notifier } from '@airbrake/browser';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.airbrake = new Notifier({
      projectId: 205621,
      projectKey: '9e01cdfb925e794d6aafe8eccb03695f',
      environment: 'development',
    });
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });
    // Send error to Airbrake
    this.airbrake.notify({
      error: error,
      params: { info: info },
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: '#BE1E2D',
            padding: 20,
          }}>
          <Text
            style={{
              color: '#FFF',
              fontSize: 24,
              marginBottom: 20,
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
            Something went wrong.
          </Text>
          <Text
            style={{
              color: '#FFF',
              fontSize: 20,
              marginBottom: 20,
            }}>
            The app ran into a problem and could not continue. We apologise for
            any inconvenience this has caused.
          </Text>
          <Text style={{ color: '#FFF', fontSize: 20 }}>
            Our developers have been notified. Please close and restart the app.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
