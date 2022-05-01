import React from 'react';
import { View, Text } from 'react-native';

import buttonStyles from '../constants/ButtonStyles';
import textStyles from '../constants/TextStyles';

export default class Timer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      timerStartedAt: this.props.startTime,
      elapsedTime: 0,
      visualCount: 'STARTING',
    };

    console.log('State: ', this.state, '\n');
  }

  componentDidMount() {
    console.log('Component did mount');
    this.intervalID = setInterval(() => {
      let elapsedTime = Date.now() - this.state.timerStartedAt;
      let visualCount = this.calculateVisual(elapsedTime);
      this.props.fuelTime(visualCount);

      this.setState({
        elapsedTime: elapsedTime,
        visualCount: visualCount,
      });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }

  calculateVisual(elapsedTime) {
    let hourLength = 3600000;
    let minuteLength = 60000;

    let hoursPassed = Math.floor(elapsedTime / hourLength);
    let millisecondsLeftAfterHoursRemoved =
      elapsedTime - hoursPassed * hourLength;

    let minutesPassed = Math.floor(
      millisecondsLeftAfterHoursRemoved / minuteLength,
    );
    let secondsPassed = Math.floor(
      (millisecondsLeftAfterHoursRemoved - minutesPassed * minuteLength) / 1000,
    );

    return (
      this.str_pad_left(hoursPassed, '0', 2) +
      ':' +
      this.str_pad_left(minutesPassed, '0', 2) +
      ':' +
      this.str_pad_left(secondsPassed, '0', 2)
    );
  }

  str_pad_left(string, pad, length) {
    return (new Array(length + 1).join(pad) + string).slice(-length);
  }

  render() {
    return (
      <View>
        <Text
          style={[
            this.props.charger ? buttonStyles.label : textStyles.timer,
            this.props.charger && { color: '#FCBD12' },
          ]}>
          {this.state.visualCount}
        </Text>
      </View>
    );
  }
}
