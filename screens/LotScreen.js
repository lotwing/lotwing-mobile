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
           
            console.log('\n\nPOPULATING LOADED DATA: ');
            lotview.setState({
              centerCoordinate: lot_coords[Math.round(lot_coords.length/2) -1],
              lotShapes: GlobalVariables.LOT_DATA,
            });
          });
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
          "coordinates": [coordinates]
        }
    };
    return empty_polygon_geojson
  }

  _createFeatureCollection(features) {
    // const empty_feature_collection_geojson = {
    //   "id": "parking_spaces",
    //   "type": "fill",
    //   "data": {
    //     "type": "FeatureCollection",
    //     "features": [features]
    //   }
    // };
    features = features.slice(0,2);
    const fc = {
      "type": "FeatureCollection",
      "features": [
          {
              "type": "Feature",
              "geometry": {
                  "type": "Point",
                  "coordinates": [
                      -80.835564,
                      35.399172
                  ]
              }
          },
      ]
    };

    const padang = {
      "type": "FeatureCollection",
      "features": [p]
    };

    const p = {
        "type": "Polygon",
        "coordinates": [
          [
              [
                  100,
                  0
              ],
              [
                  101,
                  0
              ],
              [
                  101,
                  1
              ],
              [
                  100,
                  1
              ],
              [
                  100,
                  0
              ]
          ]
      ]
    };

    const empty_feature_collection_geojson = {
        "id": "parking_spaces",
        "type": "FeatureCollection",
        "features": [p]
    };

    return fc
  }

  renderParkingSpaces() {
    const all_parking_space_coordinates = this.getAllParkingSpaceCoordinates();
    
    const parking_space_shapes = [];

    // TRY 1: Each Parking space has it's own ShapeSource -- this is not rendering BUT would be better for handling clicks/individual interactions
    // if (all_parking_space_shapes["id"] != "empty_geojson") {
    //   console.log('     PARKING SPACES  are  LOADED');

    //   all_parking_space_shapes.forEach((parking_shape, index) => {
    //     parking_space_shapes.push(
    //       <Mapbox.ShapeSource
    //         id={parking_shape["id"]}
    //         key={'parking_spaces' + index}
    //         shape={parking_shape}>
    //         <Mapbox.FillLayer
    //           id ='parking_space_fill'
    //           key={'parking_spaces_fill' + index}
    //           style={layerStyles.parking_spaces} />
    //       </Mapbox.ShapeSource>
    //     ) 
    //   });
    // }

    // TRY 2: All Parking spaces rendered using a Multipolygon
    if (all_parking_space_coordinates) {
      parking_space_geojson["geometry"]["coordinates"] = all_parking_space_coordinates;

      console.log('     returning MultiPolygon')
      return (
        <Mapbox.ShapeSource
        id={parking_space_geojson["id"]}
        key={'parking_spaces'}
        shape={parking_space_geojson}>
        <Mapbox.FillLayer
          id ='parking_space_fill'
          key={'parking_spaces_fill'}
          style={layerStyles.parking_spaces} />
      </Mapbox.ShapeSource>
      )
  

    // TRY 3: Feature Collection
    // if (all_parking_space_coordinates) {
    //   let polygons = all_parking_space_coordinates.map((ps_coordinates, count) => this._createNewPolygon(ps_coordinates, count));
    //   let featureCollection = this._createFeatureCollection(polygons);
    //   console.log('     returning FeatureCollection\n\n', featureCollection);

    //   return (
    //     <Mapbox.ShapeSource
    //     id={parking_space_geojson["id"]}
    //     key={'parking_spaces'}
    //     shape={featureCollection}>
    //     <Mapbox.FillLayer
    //       id ='parking_space_fill'
    //       key={'parking_spaces_fill'}
    //       style={layerStyles.parking_spaces} />
    //   </Mapbox.ShapeSource>
    //   )
    
    } else {
      console.log('     PARKING SPACES  not  LOADED');
    }

    console.log('     # of spaces: ', parking_space_shapes.length, '\n\n');
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