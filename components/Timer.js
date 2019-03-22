import React from 'react';
import {
  AsyncStorage,
  View,
  Text,
} from 'react-native';


import buttonStyles from '../constants/ButtonStyles';
import pageStyles from '../constants/PageStyles';
import textStyles from '../constants/TextStyles';

import LotActionHelper from '../helpers/LotActionHelper';

export default class Timer extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			timerStartedAt: this.props.startTime,
			elapsedTime: 0,
			visualCount: '00:00:00',
		};
		
		console.log('State: ', this.state, '\n');
	}

	componentDidMount() {
		console.log('Component did mount');
		setInterval(() => {
			let elapsedTime = Date.now() - this.state.timerStartedAt;
			let visualCount = this.calculateVisual(elapsedTime);
			console.log('VISUAL COUNT: ', visualCount);
		
			this.setState({ 
				elapsedTime: elapsedTime,
				visualCount: visualCount,
			});

			}, 1000);
	}

	_incrementTimer(context) {

		let elapsedTime = Date.now() - context.state.timerStartedAt;
		let visualCount = context.calculateVisual(elapsedTime, context);
		console.log('VISUAL COUNT: ', visualCount);
		
		context.setState({ 
			elapsedTime: elapsedTime,
			visualCount: visualCount,
		})
	}

	calculateVisual(elapsedTime) {
		let hourLength = 3600;
		let minuteLength = 60;

		let hoursPassed = Math.floor(elapsedTime/hourLength);
		let secondsLeftAfterHoursRemoved = elapsedTime - hoursPassed * hourLength;

		let minutesPassed = Math.floor(secondsLeftAfterHoursRemoved/minuteLength);
		let secondsPassed = secondsLeftAfterHoursRemoved - minutesPassed * minuteLength;

		return this.str_pad_left(hoursPassed,'0',2)+':'+this.str_pad_left(minutesPassed,'0',2)+':'+this.str_pad_left(secondsPassed,'0',2)
	}

	str_pad_left(string, pad, length) {
    	return (new Array(length+1).join(pad)+string).slice(-length);
	}


	render() {
		return (
			<View style={[pageStyles.darkBody, pageStyles.column]}>
				<Text style={textStyles.header}>
	            	{this.state.visualCount}</Text>
	  		</View>
		)
	}


}