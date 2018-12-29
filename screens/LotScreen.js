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
      this.state = {
        centerCoordinate:[0, 0],
        lotShapes: null,
        errorLoading: false,
      }

      this._loadLotView(); // TODO(adwoa): add error handling when fetching data, ....catch(error => { lotview.setState({errorLoading: true, ...})})
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
            lot_geometry = GlobalVariables.LOT_DATA['parking_lots'][0]["geo_info"]["geometry"]
            lot_coords = lot_geometry["coordinates"][0];
           
            lotview.setState({
              centerCoordinate: lot_coords[Math.round(lot_coords.length/2) -1],
              lotShapes: GlobalVariables.LOT_DATA,
            });
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

  getLot() {
    console.log('LOT SHAPES: ', this.state.lotShapes);
    if (this.state.lotShapes) {
      return this.state.lotShapes['parking_lots'][0]["geo_info"]
    }
    return null
  }

  getBuildings() {
    if (this.state.lotShapes){
      return this.state.lotShapes['buildings'][0]["geo_info"]
    }  
    return null
  }

  getSpaces() {
    if (this.state.lotShapes) {
      return this.state.lotShapes['parking_spaces'][0]["geo_info"]
    }
    return null
  }

  render() {
    const layerStyles = Mapbox.StyleSheet.create({
      buildings: {
        fillColor: 'red',
        fillOpacity: 0.75,
      },
      parking_lot: {
        fillColor: Mapbox.StyleSheet.source(
          [
            [0, '#F2F12D'],
            [100, '#EED322'],
            [1000, '#E6B71E'],
            [5000, '#DA9C20'],
            [10000, '#CA8323'],
            [50000, '#B86B25'],
            [100000, '#A25626'],
            [500000, '#8B4225'],
            [1000000, '#723122'],
          ],
          'population',
          Mapbox.InterpolationMode.Exponential,
        ),
       fillOpacity: 0.75,
      },
      parking_spaces: {
        fillColor: 'orange',
        fillOpacity: 0.75,
      }
    });


    return (
      <View style={styles.container}>
        <Mapbox.MapView
            centerCoordinate={this.state.centerCoordinate}
            showUserLocation={true}
            style={styles.container}
            styleURL={Mapbox.StyleURL.Street}
            zoomLevel={16}>

            <Mapbox.ShapeSource
              id='parking_lot'
              shape={example_response["parking_lots"][0]["geo_info"]}>
              <Mapbox.FillLayer
                id='fill_parking_lot'
                style={layerStyles.parking_lot} />
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


const example_response = {"parking_lots":[{"id":109,"geo_info":{"id":"b3f2c4bd094417f1a75649788188d4ae","type":"Feature","properties":{},"geometry":{"coordinates":[[[-122.00795251095994,37.35328491285209],[-122.0072706293752,37.35329121557868],[-122.0072706293752,37.353206128777984],[-122.00613283859465,37.35322503695677],[-122.00610905202916,37.352352104020525],[-122.00752831718377,37.352367861027034],[-122.00753624604097,37.35284056955827],[-122.007956475387,37.35283426679378],[-122.00795251095994,37.35328491285209]]],"type":"Polygon"}},"created_at":"2018-10-04T02:24:03.861Z","updated_at":"2018-10-04T02:24:03.861Z","shape_type":"parking_lot","dealership_id":2,"most_recently_tagged_at":null}],"buildings":[{"id":110,"geo_info":{"id":"943cc84a4c073a74a0061c2b9c48f467","type":"Feature","properties":{},"geometry":{"coordinates":[[[-122.00697906373179,37.35295655170566],[-122.00697906373179,37.35266969577961],[-122.0065666479091,37.352674818216826],[-122.0065666479091,37.35255870956236],[-122.00623156005213,37.35255870956236],[-122.00623156005213,37.35295313676387],[-122.00697906373179,37.35295655170566]]],"type":"Polygon"}},"created_at":"2018-10-04T02:26:14.894Z","updated_at":"2018-10-04T02:26:14.894Z","shape_type":"building","dealership_id":2,"most_recently_tagged_at":null}],"parking_spaces":[]};


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

// <Mapbox.ShapeSource
//   id='parking_lot'
//   shape={this.getLot(this.state.lotShapes)}>
//   <Mapbox.FillLayer
//     id='fill_parking_lot'
//     style={layerStyles.parking_lot} />
// </Mapbox.ShapeSource>

// <Mapbox.ShapeSource
//   id ='buildings'
//   shape={this.getBuildings(this.state.lotShapes)}>
//   <Mapbox.FillLayer
//     id ='fill_buildings_lot'
//     style={layerStyles.buildings} />
// </Mapbox.ShapeSource>

// <Mapbox.ShapeSource
//   id ='parking_spaces'
//   shape={this.getSpaces(this.state.lotShapes)}>
//   <Mapbox.FillLayer
//     id ='fill_parking_spaces'
//     style={layerStyles.parking_spaces} />
// </Mapbox.ShapeSource>