import React from 'react';
import {
  Text,
  View,
} from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';

export default class LotScreen extends React.Component {
  static navigationOptions = {
    header: null,
    title: 'The Lot',
  };

  render() {
  	return (
  		<LotView />
  	);
  }
}

class LotView extends React.Component {
  
  constructor(props) {
      super(props);
  }

  _loadLotView() {
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
      <View style={styles.container}>
        <Text>Lot View</Text>
        <Mapbox.MapView
            styleURL={Mapbox.StyleURL.Street}
            zoomLevel={15}
            centerCoordinate={[11.256, 43.770]}
            style={styles.container}>
        </Mapbox.MapView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center", 
    justifyContent: "center",
  }
}