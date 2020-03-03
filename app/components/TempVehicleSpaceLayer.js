import React from 'react';
import { View, Text, Platform, StyleSheet, ActionSheetIOS } from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

import Mapbox from '@react-native-mapbox-gl/maps';

/**
 *
 * Lot shapes include:
 * parking_lots, buildings, parking_spaces
 */
export default class TempVehicleSpaceLayer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.onSourceLayerPress = this.onSourceLayerPress.bind(this);
  }

  _createNewPolygon(coordinates, id) {
    const empty_polygon_geojson = {
      id: id,
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: coordinates,
      },
    };
    return empty_polygon_geojson;
  }

  _createFeatureCollection(list_of_features) {
    return {
      type: 'FeatureCollection',
      features: list_of_features,
    };
  }

  /**
   * Launches the tag handler for the object that was pressed.
   * @param e : object returned from the system's onPress handler
   */
  onSourceLayerPress(e) {
    let payload = e.nativeEvent.payload;
    const space_id = payload.id;
    console.log('\n\nSource layer pressed');
    console.log(
      '\n\nPressed Feature ID: ',
      space_id,
      '  - type ',
      this.props.type,
    );
    this.props.showAndPopulateModal(
      [space_id, GlobalVariables.EMPTY_MODAL_TYPE],
      payload,
    );
  }

  getAllParkingSpaceCoordinatesObject() {
    if (this.props.spaces.length > 0) {
      let coordinatesObject = {};
      this.props.spaces.forEach(id => {
        if (this.props.parkingShapes[id].temporary) {
          coordinatesObject[id] = this.props.parkingShapes[
            id
          ].geo_info.geometry.coordinates;
        }
      });
      return coordinatesObject;
    }
    return null;
  }

  renderParkingSpaces() {
    const ps_coord_obj = this.getAllParkingSpaceCoordinatesObject();

    if (ps_coord_obj) {
      let polygons = Object.keys(ps_coord_obj).map(ps_id =>
        this._createNewPolygon(ps_coord_obj[ps_id], ps_id),
      );

      let featureCollection = this._createFeatureCollection(polygons);

      return (
        <Mapbox.ShapeSource
          id={this.props.type}
          key={this.props.type}
          onPress={this.onSourceLayerPress}
          shape={featureCollection}>
          <Mapbox.LineLayer
            id={`parking_spaces_fill-${this.props.type}`}
            key={`parking_spaces_fill-${this.props.type}`}
            style={{ lineWidth: 0.5, lineColor: '#FFF' }}
          />
        </Mapbox.ShapeSource>
      );
    }

    return [];
  }

  render() {
    return this.renderParkingSpaces();
  }
}
