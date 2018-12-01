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
		return fetch(GlobalVariables.BASE_ROUTE + Route.PARKING_LOT , {
				method: 'GET',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Authorization': 'Bearer '+ GlobalVariables.ACCESS_TOKEN,
			  	},
			})
			.then((response) => response.json())
      		.then((responseJson) => {
				console.log(responseJson);
				GlobalVariables.LOTS = responseJson['parking_lots'];
			});
	}

	render() {
		return (
			<View>
			</View>
		)
	}
}