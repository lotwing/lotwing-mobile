import React from 'react';
import {
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
      this.onSourceLayerPress = this.onSourceLayerPress.bind(this);
  }

  /**
   * Loads all of the data associated with a lot and updates 
   * the associated state variables, triggering a reload of
   * the lotview.
   */
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
           
            console.log('\n\nPOPULATING LOADED DATA: ');
            lotview.setState({
              centerCoordinate: lot_coords[Math.round(lot_coords.length/2) -1],
              lotShapes: GlobalVariables.LOT_DATA,
            });
          });
  }

  /**
   * Launches the tag handler for the object that was pressed.
   * @param e : object returned from the system's onPress handler
   */
  onSourceLayerPress(e) {
    const feature = e.nativeEvent.payload;
    console.log('You pressed a layer here is your feature', feature); // eslint-disable-line
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
    console.log('Running getLot...');
    if (this.state.lotShapes) {
      console.log('     getLot returning data');
      return this.state.lotShapes['parking_lots'][0]["geo_info"]
    }
    return GlobalVariables.EMPTY_GEOJSON
  }

  getBuildings() {
    console.log('Running getBuildings...');
    if (this.state.lotShapes){
      console.log('     getBuildings returning data');
      return this.state.lotShapes['buildings'][0]["geo_info"]
    }  
    return GlobalVariables.EMPTY_GEOJSON
  }

  getAllParkingSpaceShapes() {
    console.log('Running getAllParkingSpaceShapes..');
    if (this.state.lotShapes) {
      console.log('     getAllParkingSpaceShapes returning data');
      return this.state.lotShapes['parking_spaces'].map((space) => space["geo_info"])
    }
    return GlobalVariables.EMPTY_GEOJSON
  }

  getAllParkingSpaceCoordinates() {
    console.log('Running getAllParkingSpaceCoordinates..');
    if (this.state.lotShapes) {
      console.log('     getAllParkingSpaceCoordinates returning data');
      return this.state.lotShapes['parking_spaces'].map((space) => space["geo_info"]["geometry"]["coordinates"])
    }
    return null
  }

  _createNewPolygon(coordinates, id) {
    const empty_polygon_geojson = {
      "id": id,
      "type": "Feature",
      "geometry": {
          "type": "Polygon",
          "coordinates": coordinates
        }
    };
    return empty_polygon_geojson
  }

  _createFeatureCollection(list_of_features) {
    return ({
      "type": "FeatureCollection",
      "features": list_of_features
    })
  }

  renderParkingSpaces() {
    const all_parking_space_coordinates = this.getAllParkingSpaceCoordinates();
    const parking_space_shapes = [];

    if (all_parking_space_coordinates) {
      let polygons = all_parking_space_coordinates.map((ps_coordinates, count) => this._createNewPolygon(ps_coordinates, count));
      let featureCollection = this._createFeatureCollection(polygons);

      return (
        <Mapbox.ShapeSource
          id={parking_space_geojson["id"]}
          key={'parking_spaces'}
          onPress={this.onSourceLayerPress}
          shape={featureCollection}>
          <Mapbox.FillLayer
            id ='parking_space_fill'
            key={'parking_spaces_fill'}
            style={layerStyles.parking_spaces} />
       </Mapbox.ShapeSource>
      )
    }

    console.log('     PARKING SPACES  not  LOADED');
    return parking_space_shapes
  }

  render() {
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
            shape={this.getLot()}>
            <Mapbox.FillLayer
              id='fill_parking_lot'
              style={layerStyles.parking_lot} />
          </Mapbox.ShapeSource>

          <Mapbox.ShapeSource
            id ='buildings'
            shape={this.getBuildings()}>
            <Mapbox.FillLayer
              id ='fill_buildings_lot'
              style={layerStyles.buildings} />
          </Mapbox.ShapeSource>

          {this.renderParkingSpaces()}

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

const layerStyles = Mapbox.StyleSheet.create({
  buildings: {
    fillColor: '#FF9933',
    fillOpacity: 0.75,
  },
  empty_parking_spaces: {
    fillColor: '#FFFFFF',
    fillOpacity: 0.75,
  },
  new_vehicle_occupied_spaces: {
    fillColor: '#006699',
    fillOpacity: 0.75,
  },
  parking_lot: {
    fillColor: '#CCCCCC',
   fillOpacity: 1,
  },
  parking_spaces: {
    fillColor: '#FFFFFF',
    fillOpacity: 0.75,
  },
  used_vehicle_occupied_spaces: {
    fillColor: '#66CC00',
    fillOpacity: 0.75,
  },
});

const parking_space_geojson = {
  "id": "parking_spaces",
  "type": "Feature",
  "properties": {},
  "geometry": {
    "coordinates": [],
    "type": "MultiPolygon"
  }
};

const debug_location = [37.353285, -122.0079];