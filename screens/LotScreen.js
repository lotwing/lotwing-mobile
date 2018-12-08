import React from 'react';
import {
  Text,
  View,
  StyleSheet,
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
});


const example_response = {"parking_lots":[{"id":109,"geo_info":{"id":"b3f2c4bd094417f1a75649788188d4ae","type":"Feature","properties":{},"geometry":{"coordinates":[[[-122.00795251095994,37.35328491285209],[-122.0072706293752,37.35329121557868],[-122.0072706293752,37.353206128777984],[-122.00613283859465,37.35322503695677],[-122.00610905202916,37.352352104020525],[-122.00752831718377,37.352367861027034],[-122.00753624604097,37.35284056955827],[-122.007956475387,37.35283426679378],[-122.00795251095994,37.35328491285209]]],"type":"Polygon"}},"created_at":"2018-10-04T02:24:03.861Z","updated_at":"2018-10-04T02:24:03.861Z","shape_type":"parking_lot","dealership_id":2,"most_recently_tagged_at":null}],"buildings":[{"id":110,"geo_info":{"id":"943cc84a4c073a74a0061c2b9c48f467","type":"Feature","properties":{},"geometry":{"coordinates":[[[-122.00697906373179,37.35295655170566],[-122.00697906373179,37.35266969577961],[-122.0065666479091,37.352674818216826],[-122.0065666479091,37.35255870956236],[-122.00623156005213,37.35255870956236],[-122.00623156005213,37.35295313676387],[-122.00697906373179,37.35295655170566]]],"type":"Polygon"}},"created_at":"2018-10-04T02:26:14.894Z","updated_at":"2018-10-04T02:26:14.894Z","shape_type":"building","dealership_id":2,"most_recently_tagged_at":null}],"parking_spaces":[]}