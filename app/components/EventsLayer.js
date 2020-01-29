import React from 'react';
import { StyleSheet, View } from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';

import Mapbox from '@react-native-mapbox-gl/maps';
import circle from '@turf/circle';
import LotActionHelper from '../helpers/LotActionHelper';

/**
 *
 * Lot shapes include:
 * parking_lots, buildings, parking_spaces
 */
export default class EventsLayer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { loading: true };
    this.renderEvents = this.renderEvents.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ loading: false });
  }
  _createNewPolygon(coordinates, id) {
    const size = this.props.type === 'note' ? 0.0007 : 0.0007;
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
    const updatedCoordinates = [h, v];
    const generatedCoordinates = circle(updatedCoordinates, size, {
      steps: 30,
      units: 'kilometers',
    });
    const empty_polygon_geojson = {
      id: id,
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: generatedCoordinates.geometry.coordinates,
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

  getAllEventsCoordinatesObject() {
    if (Object.keys(this.props.eventShapes).length > 0) {
      return this.props.eventShapes;
    } else {
      return null;
    }
  }

  renderEvents() {
    const event_coord_obj = this.getAllEventsCoordinatesObject();
    let featureCollection = {};
    if (event_coord_obj) {
      let polygons = Object.keys(event_coord_obj).map(ps_id =>
        this._createNewPolygon(
          event_coord_obj[ps_id].parking_space.geometry.coordinates,
          ps_id,
        ),
      );

      featureCollection = this._createFeatureCollection(polygons);
    } else {
      featureCollection = GlobalVariables.EMPTY_GEOJSON;
    }

    if (!this.state.loading) {
      return (
        <Mapbox.ShapeSource
          id={this.props.type}
          key={this.props.type}
          shape={featureCollection}>
          <Mapbox.FillExtrusionLayer
            id={`fill_${this.props.type}`}
            key={`fill_${this.props.type}`}
            style={
              this.props.type === 'note'
                ? lotLayerStyles.noteEvent
                : lotLayerStyles.events
            }
          />
        </Mapbox.ShapeSource>
      );
    }
    return null;
  }

  render() {
    return this.renderEvents();
  }
}

const lotLayerStyles = {
  // NOTE: On web all shapes have an opacity of 1 barring parking_lot whose opacity is 0.4
  events: {
    fillExtrusionColor: '#FFFF00',
  },
  noteEvent: {
    fillExtrusionColor: '#A0291E',
  },
};
