import React from 'react';
import { View, Text, Platform, StyleSheet, ActionSheetIOS } from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';
import polygon from '@turf/helpers';

import Mapbox from '@react-native-mapbox-gl/maps';

/**
 *
 * Lot shapes include:
 * parking_lots, buildings, parking_spaces
 */
export default class DuplicatesLayer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      parking_space_geojson: {
        id: 'parking_spaces',
        type: 'Feature',
        properties: {},
        geometry: {
          coordinates: [],
          type: 'MultiPolygon',
        },
      },
      spaceVehicleMap: {},
    };

    this.onSourceLayerPress = this.onSourceLayerPress.bind(this);
  }

  _createNewPolygon(coordinates, id) {
    let left = coordinates[0][0][0];
    let right = coordinates[0][0][0];
    let top = coordinates[0][0][1];
    let bottom = coordinates[0][0][1];

    coordinates[0].forEach(pair => {
      if (pair[0] < left) {
        left = pair[0];
      }
      if (pair[0] > right) {
        right = pair[0];
      }
      if (pair[1] < bottom) {
        bottom = pair[1];
      }
      if (pair[1] > top) {
        top = pair[1];
      }
    });
    //console.log(left, right, top, bottom)
    const h = left + (right - left) / 2;
    const v = bottom + (top - bottom) / 2;
    const scale = 0.0000018;
    const armLength = scale * 3.7;
    //console.log(coordinates)
    //const updatedCoordinates = [horizontalCoords, verticalCoords]
    const generatedCoordinates = [
      [
        [
          [h + scale, v + scale],
          [h + scale, v + armLength],
          [h - scale, v + armLength],
          [h - scale, v + scale],
          [h - armLength, v + scale],
          [h - armLength, v - scale],
          [h - scale, v - scale],
          [h - scale, v - armLength],
          [h + scale, v - armLength],
          [h + scale, v - scale],
          [h + armLength, v - scale],
          [h + armLength, v + scale],
          [h + scale, v + scale],
        ],
      ],
    ];
    const empty_polygon_geojson = {
      id: id,
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: generatedCoordinates,
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
    if (this.props.type == 'empty') {
      this.props.showAndPopulateModal(
        [space_id, GlobalVariables.EMPTY_MODAL_TYPE],
        payload,
      );
    } else {
      this.props.showAndPopulateModal([space_id, null], payload);
    }
  }

  getAllParkingSpaceCoordinatesObject() {
    if (this.props.spaces.length > 0) {
      this.setState({ loading: false });
      let coordinatesObject = {};

      this.props.spaces.forEach(id => {
        if (this.props.recent) {
          const updatedAt = new Date(this.props.parkingShapes[id].updated_at);
          const now = new Date();
          const oneDay = 60 * 60 * 24 * 1000;
          //console.log('Time: ', now-updatedAt, 'One day: ', oneDay)
          if (now - updatedAt < oneDay) {
            //console.log('New')
            coordinatesObject[id] = this.props.parkingShapes[
              id
            ].geo_info.geometry.coordinates;
          }
        } else {
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
      if (!this.state.loading) {
        return (
          <Mapbox.ShapeSource
            id={this.props.type}
            key={this.props.type}
            //onPress={this.onSourceLayerPress}
            shape={featureCollection}>
            <Mapbox.FillLayer
              id={`parking_spaces_fill-${this.props.type}`}
              key={`parking_spaces_fill-${this.props.type}`}
              style={{ fillColor: '#FFF' }}
            />
          </Mapbox.ShapeSource>
        );
      }
      return null;
    }

    return [];
  }

  render() {
    return this.renderParkingSpaces();
  }
}
