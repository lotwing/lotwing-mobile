import React from 'react';
import {
  View,
  Text,
  Platform,
  StyleSheet,
  ActionSheetIOS,
} from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

import Mapbox from '@mapbox/react-native-mapbox-gl';

/**
 *
 * Lot shapes include:
 * parking_lots, buildings, parking_spaces
 */
export default class VehicleSpaceLayer extends React.Component {
  
  constructor(props) {
      super(props);

      this.state = {
        parking_space_geojson: {
          "id": "parking_spaces",
          "type": "Feature",
          "properties": {},
          "geometry": {
            "coordinates": [],
            "type": "MultiPolygon"
          },
        },
        spaceVehicleMap: {},
      }

      this.onSourceLayerPress = this.onSourceLayerPress.bind(this);
      this._loadLotVehicleData();
  }

  _loadLotVehicleData() {
    var vehicleSpaceLayer = this;
    let spaceVehicleMapObject = {};

    let url_base = GlobalVariables.BASE_ROUTE + Route.VEHICLE_BY_SPACE;
    let vehiclePromises = vehicleSpaceLayer.props.spaces.map((space_id) => url_base + space_id);

    return Promise.all(vehiclePromises.map((url) => {
      return fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer '+ GlobalVariables.LOTWING_ACCESS_TOKEN,
          },
        })
      .then((response) => response.json())
    }))
    .then((vehicleResponses) => {
      vehicleResponses.forEach((vehicle) => {
        let parking_space_id = vehicle["shape"]["id"];
        spaceVehicleMapObject[parking_space_id] = vehicle["vehicle"];
      });

      vehicleSpaceLayer.setState({
        spaceVehicleMap: spaceVehicleMapObject,
      });
    })
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

  /**
   * Launches the tag handler for the object that was pressed.
   * @param e : object returned from the system's onPress handler
   */
  onSourceLayerPress(e) {
    const space_id = parseInt(e.nativeEvent.payload['id']);

    console.log('\n\nPressed Feature ID: ', space_id, '  - type ', this.props.type);

    if (this.props.type == 'new_vehicle' || this.props.type == 'used_vehicle') {
      // Handle Tag Actions
      console.log('POPULATED Space Pressed');
      let vehicle_data = this.state.spaceVehicleMap[space_id];

      // console.log('Changing visibility from: ', this.state.modalVisible);
      // this.setModalVisible(!this.state.modalVisible);
      
    } else {
      console.log('EMPTY Space Pressed');
    }

  }

  getAllParkingSpaceCoordinatesObject() {
    if (this.props.spaces.length > 0) {
      let coordinatesObject = {};
      
      this.props.spaces.forEach((id) => {
        coordinatesObject[id] = this.props.parkingShapes[id]["geo_info"]["geometry"]["coordinates"];
      });
      return coordinatesObject
    }
    return null
  }

  renderParkingSpaces() {
    const ps_coord_obj = this.getAllParkingSpaceCoordinatesObject();
    const parking_space_shapes = [];

    if (ps_coord_obj) {
      let polygons = Object.keys(ps_coord_obj)
        .map((ps_id) => this._createNewPolygon(ps_coord_obj[ps_id], ps_id));
      
      let featureCollection = this._createFeatureCollection(polygons);
      console.log(this.props.type, '| SPACES LOADED ');
      console.log('Number of Features: ', polygons.length);

      return (
        <Mapbox.ShapeSource
          id={this.props.type}
          key={this.props.type}
          onPress={this.onSourceLayerPress}
          shape={featureCollection}>
          <Mapbox.FillLayer
            id ={'parking_space_fill' + '-' + this.props.type}
            key={'parking_spaces_fill'+ '-' + this.props.type}
            style={this.props.style} />
       </Mapbox.ShapeSource>
      )
    }

    console.log('     PARKING SPACES  -not-  LOADED');
    return parking_space_shapes
  }

  render() {
  	return this.renderParkingSpaces();
  }
}