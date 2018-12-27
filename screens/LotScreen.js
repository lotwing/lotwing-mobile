import React from 'react';
import {
  Text,
  View,
  StyleSheet,
} from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

import Mapbox from '@mapbox/react-native-mapbox-gl';

/**
 *
 * Lot shapes include:
 * parking_lots, buildings, parking_spaces
 */
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
      this._loadLotView();
  }

  _loadLotView() {
    var lotview = this;

    return fetch(GlobalVariables.BASE_ROUTE + Route.FULL_LOT , {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer '+ GlobalVariables.LOTWING_ACCESS_TOKEN,
          },
      })
      .then((response) => response.json())
          .then((responseJson) => {
            GlobalVariables.LOT_DATA = responseJson;

            // TODO(adwoa): ask question about how multiple parking lots are listed and sorted within the get lot response
            lot_coords = GlobalVariables.LOT_DATA['parking_lots'][0]["geo_info"]["geometry"]["coordinates"][0];
            GlobalVariables.CENTER_COORDINATE = lot_coords[Math.round(lot_coords.length/2) -1];

            //TODO(adwoa): Set the bearing of the map so it is centered over the current lot

            lotview.add_shapes_to_map(GlobalVariables.LOT_DATA);
          });
  }

  add_shapes_to_map(dataToRender) {
  }

  // Function from the Lotwing Web Application
  map_shape_type_to_color(shape_type) {
    var hash  = {
                  "new_vehicle_occupied_spaces": "#006699",
                  "used_vehicle_occupied_spaces": "#66CC00",
                  'empty_parking_spaces': '#FFFFFF',
                  'parking_spaces': '#FFFFFF',
                  "parking_lots": '#CCCCCC',
                  "buildings": '#FF9933',
                }

    return hash[shape_type]
  }


  // Function from the Lotwing Web Application
  map_shape_type_to_opacity(shape_type){
    if (shape_type == 'parking_lots'){
      return 0.4
    }else{
      return 1
    }
  }

  render() {
    // const lot_draw_props = {
    //   id: this.props.id,
    //   url: this.props.url,
    //   shape: this._getShape(),
    //   hitbox: this.props.hitbox,
    //   hasPressListener: isFunction(this.props.onPress),
    //   onMapboxShapeSourcePress: this.props.onPress,
    //   cluster: this.props.cluster ? 1 : 0,
    //   clusterRadius: this.props.clusterRadius,
    //   clusterMaxZoomLevel: this.props.clusterMaxZoomLevel,
    //   maxZoomLevel: this.props.maxZoomLevel,
    //   buffer: this.props.buffer,
    //   tolerance: this.props.tolerance,
    //   ...this._getImages(),
    //   onPress: undefined,
    // };

    return (
      <View style={styles.container}>
        <Text>Lot View</Text>

        <Mapbox.MapView
            centerCoordinate={GlobalVariables.CENTER_COORDINATE}
            showUserLocation={true}
            styleURL={Mapbox.StyleURL.Street}
            style={styles.container}
            zoomLevel={3}>
            <Mapbox.ShapeSource
              shape={GlobalVariables.LOT}>
            </Mapbox.ShapeSource>
        </Mapbox.MapView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
});


const example_response = {"parking_lots":[{"id":109,"geo_info":{"id":"b3f2c4bd094417f1a75649788188d4ae","type":"Feature","properties":{},"geometry":{"coordinates":[[[-122.00795251095994,37.35328491285209],[-122.0072706293752,37.35329121557868],[-122.0072706293752,37.353206128777984],[-122.00613283859465,37.35322503695677],[-122.00610905202916,37.352352104020525],[-122.00752831718377,37.352367861027034],[-122.00753624604097,37.35284056955827],[-122.007956475387,37.35283426679378],[-122.00795251095994,37.35328491285209]]],"type":"Polygon"}},"created_at":"2018-10-04T02:24:03.861Z","updated_at":"2018-10-04T02:24:03.861Z","shape_type":"parking_lot","dealership_id":2,"most_recently_tagged_at":null}],"buildings":[{"id":110,"geo_info":{"id":"943cc84a4c073a74a0061c2b9c48f467","type":"Feature","properties":{},"geometry":{"coordinates":[[[-122.00697906373179,37.35295655170566],[-122.00697906373179,37.35266969577961],[-122.0065666479091,37.352674818216826],[-122.0065666479091,37.35255870956236],[-122.00623156005213,37.35255870956236],[-122.00623156005213,37.35295313676387],[-122.00697906373179,37.35295655170566]]],"type":"Polygon"}},"created_at":"2018-10-04T02:26:14.894Z","updated_at":"2018-10-04T02:26:14.894Z","shape_type":"building","dealership_id":2,"most_recently_tagged_at":null}],"parking_spaces":[]}

// export const NATIVE_MODULE_NAME = 'RCTMGLShapeSource';
// const RCTMGLShapeSource = requireNativeComponent(
//   NATIVE_MODULE_NAME,
//   ShapeSource,
//   {
//     nativeOnly: {
//       nativeImages: true,
//       hasPressListener: true,
//       onMapboxShapeSourcePress: true,
//     },
//   },
// );