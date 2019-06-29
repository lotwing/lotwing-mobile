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
export default class VehicleSpaceLayer extends React.PureComponent {

  constructor(props) {
      super(props);

      this.state = {
        loading: false,
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
    let payload = e.nativeEvent.payload;
    const space_id = payload['id'];

    console.log('\n\nSource layer pressed');
    console.log('\n\nPressed Feature ID: ', space_id, '  - type ', this.props.type);
    if (this.props.type == 'empty') {
      this.props.showAndPopulateModal([space_id, GlobalVariables.EMPTY_MODAL_TYPE], payload);
    } else {
      this.props.showAndPopulateModal([space_id, null], payload);
    }
  }

  getAllParkingSpaceCoordinatesObject() {
    if (this.props.spaces.length > 0) {
      let coordinatesObject = {};

      this.props.spaces.forEach((id) => {
        if (this.props.recent) {
          const updatedAt = new Date(this.props.parkingShapes[id]["updated_at"])
          const now = new Date();
          const oneDay = 60*60*24*1000;
          //console.log('Time: ', now-updatedAt, 'One day: ', oneDay)
          if ((now-updatedAt) < oneDay) {
            //console.log('New')
            coordinatesObject[id] = this.props.parkingShapes[id]["geo_info"]["geometry"]["coordinates"];
          }
        } else {
          coordinatesObject[id] = this.props.parkingShapes[id]["geo_info"]["geometry"]["coordinates"];
        }
      });
      return coordinatesObject
    }
    return null
  }

  renderParkingSpaces() {
    const ps_coord_obj = this.getAllParkingSpaceCoordinatesObject();

    if (ps_coord_obj) {

      let polygons = Object.keys(ps_coord_obj)
        .map((ps_id) => this._createNewPolygon(ps_coord_obj[ps_id], ps_id));

      let featureCollection = this._createFeatureCollection(polygons);

      return (
        <Mapbox.ShapeSource
          id={this.props.recent ? `${this.props.type}-recent` : this.props.type}
          key={this.props.recent ? `${this.props.type}-recent` : this.props.type}
          onPress={this.onSourceLayerPress}
          shape={featureCollection}>
          <Mapbox.FillLayer
            id={this.props.recent ? `parking_spaces_fill-${this.props.type}-recent` : `parking_spaces_fill-${this.props.type}`}
            key={this.props.recent ? `parking_spaces_fill-${this.props.type}-recent` : `parking_spaces_fill-${this.props.type}`}
            style={[ this.state.loading ? { fillColor: '#dadada' } : this.props.style ]} />
        </Mapbox.ShapeSource>
      )
    }

    return []
  }

  render() {
  	return (
      this.renderParkingSpaces()
    );
  }
}