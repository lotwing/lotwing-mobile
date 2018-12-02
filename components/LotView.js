import React from 'react';
import {
  View,
  Button,
} from 'react-native';


import GlobalVariables from '../constants/GlobalVariables';

export default class LotView extends React.Component {
	constructor(props) {
    	super(props);
	}

	_loadLotView() {
		console.log(GlobalVariables.LOTWING_ACCESS_TOKEN);
		debugger

		return fetch(GlobalVariables.BASE_ROUTE + Route.FULL_LOT , {
				method: 'GET',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Authorization': 'Bearer '+ GlobalVariables.LOTWING_ACCESS_TOKEN,
			  	},
			})
			.then((response) => response.json())
      		.then((responseJson) => {
				console.log(responseJson);
				
				GlobalVariables.LOTS = responseJson['parking_lots'];
				GlobalVariables.PARKING_SPACES = responseJson['parking_spaces'];
				GlobalVariables.BUILDINGS = responseJson['buildings'];
			});
	}

	render() {
		return (
			<View>
			</View>
		)
	}
}