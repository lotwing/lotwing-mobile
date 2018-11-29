import React from 'react';
import {
  Image,
  View,
} from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';

/**
 * 
 * We have a few non-RESTful resource endpoints. These will give you all shapes (Buildings, Parking Lot, parking spaces) for the current dealership
 * GET /api/shapes/parking_lots
 * GET /api/shapes/buildings
 * GET /api/shapes/parking_spaces 
 * 
 * This endpoint gives you parking spaces broken out by:
 * 		new_parking_spaces
 *  	used_parking_spaces
 * 		empty parking spaces
 * 
 * (description by aneigher)
 */
export default class Lot extends React.Component {
	constructor(props) {
    	super(props);
	}

	// componentDidMount() {
	// 	return fetch(BASE_ROUTE + '/api/shapes/parking_lots', {

	// 	})
	//     .then((response) =>
	//       {

	//       });
	// }


	render() {

	}
 }