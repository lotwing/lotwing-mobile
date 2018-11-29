import React from 'react';
import {
  Image,
  View,
} from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';

export default class Lot extends React.Component {
	constructor(props) {
    	super(props);
	}

	attemptLogin() {
		var email_in = 'aneigher@gmail.com'; // TODO(adwoa): retrieve text input from display
		var pwd_in = 'front-3011-dev'; // TODO(adwoa): retrieve text input from display

		return fetch(BASE_ROUTE + '/api/auth/login' , {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
			  	},
			  	body: JSON.stringify({
			    	email: email_in,
			    	password: pwd_in,
			  	}),
			})
			.then((response) => response.json())
      		.then((responseJson) => {
				if (responseJson.message == SUCCESSFUL_LOGIN) {
					ACCESS_TOKEN = responseJson.access_token;
				}
			});
    }

}