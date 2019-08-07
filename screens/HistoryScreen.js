import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator
} from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

import buttonStyles from '../constants/ButtonStyles';
import pageStyles from '../constants/PageStyles';
import textStyles from '../constants/TextStyles';

import LotActionHelper from '../helpers/LotActionHelper';

export default class HistoryScreen extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			space_id: 0,
			vehicle: {},
			position: 0,
			events: [],
			space_coords: []
		}
	}
	componentWillMount() {
		console.log('History Mounted')
		if (this.props.navigation.state.params) {
			const {space_id, vehicle, position} = this.props.navigation.state.params;
			this.setState({ space_id, vehicle, position })
			this.fetchHistory(space_id)
		}
	}
	componentWillReceiveProps(nextProps) {
		console.log('History Receive Props')
		if (nextProps.navigation.state.params) {
			const {space_id, vehicle, position} = nextProps.navigation.state.params;
			this.setState({ space_id, vehicle, position })
			this.fetchHistory(space_id)
		}
	}

	fetchHistory(space_id) {
		this.setState({ loading: true });
    url = GlobalVariables.BASE_ROUTE + Route.VEHICLE_BY_SPACE + space_id
    console.log('FETCH HISTORY: ', url)
    return fetch(url, {
    method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer '+ GlobalVariables.LOTWING_ACCESS_TOKEN,
        },
    })
    .then((response) => response.json())
    .then((responseJson) => {
    	this.setState({events: responseJson.events[this.state.position], loading: false, space_coords: responseJson.shape.geo_info })
    })
    .catch(err => {
      console.log('\nCAUGHT ERROR IN FETCH HISTORY: \n', err, err.name);
      return err
    })
	}
	_renderHistory() {
		if (this.state.loading) {
			return (
				<View style={{ flex: 1 }}>
					<ActivityIndicator />
				</View>
			)
		}
		return(
			<View style={[pageStyles.darkBody, pageStyles.column, { flex: 1, borderTopWidth: 1, borderBottomWidth: 0, borderTopColor: '#FFF' }]}>
				<ScrollView style={{ flex: 1 }}>
					<View style={{ paddingTop: 14, paddingBottom: 14 }}>
						{ this.state.events.map((event)=> {
							const { id, summary } = event.data.attributes
              console.log(id, summary)
							const time = summary.substring(summary.indexOf('<strong>')+9, summary.indexOf('</strong>') )
							const description = summary.substring(summary.indexOf('16px;')+7, summary.indexOf('</span>'))
							console.log('Time: ',time)
							return(
								<View key={ id } style={{ paddingTop: 5,  paddingBottom: 5 }}>
									<Text style={[textStyles.subtitle, {fontWeight: 'bold' }]}>{ time }</Text>
									<Text style={ textStyles.subtitle }>{ description }</Text>
								</View>
							);
						})}
					</View>
				</ScrollView>
				<View style={{ flex: 0, padding: 14 }}>
					<TouchableOpacity
            style={buttonStyles.activeSecondaryModalButton}
            onPress={() => this.props.navigation.navigate('Lot', { findingOnMap: true, space_coords: this.state.space_coords, refresh: false }) }>
            <Text style={buttonStyles.activeSecondaryTextColor}>
              SHOW ON MAP
            </Text>
          </TouchableOpacity>
				</View>
			</View>
		)
	}

	render() {
  	return (
  		<View style={[pageStyles.container, {justifyContent: 'flex-start', backgroundColor: '#E6E4E0'}]}>
	  		{ this.state.vehicle !== {} &&
	  			<View style={[pageStyles.darkBody, pageStyles.column ]}>
						<Text style={textStyles.header}>{this.state.vehicle.year} {this.state.vehicle.make} {this.state.vehicle.model}</Text>
		         <Text style={textStyles.subtitle}>SKU {this.state.vehicle.stockNumber}</Text>
		       </View>
		     }
  			{this._renderHistory()}
  		</View>
  	);
  }
}