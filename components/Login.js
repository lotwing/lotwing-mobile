import React from 'react';
import {
  View,
  Button,
} from 'react-native';


import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

export default class LoginButton extends React.Component {
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