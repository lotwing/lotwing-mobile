import React from 'react';
import {
  View,
} from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';

import Mapbox from '@mapbox/react-native-mapbox-gl';
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
      this.renderEvents = this.renderEvents.bind(this);
  }
  _createNewPolygon(coordinates, id) {
    const horizontalCoords = coordinates[0][0][0] + ((coordinates[0][1][0] - coordinates[0][0][0])/2)
    const verticalCoords = coordinates[0][2][1] + ((coordinates[0][0][1] - coordinates[0][2][1])/2)
    const updatedCoordinates = [horizontalCoords, verticalCoords]
    const generatedCoordinates = circle(updatedCoordinates, 0.0007, {steps: 30, units: 'kilometers'})
    const empty_polygon_geojson = {
      "id": id,
      "type": "Feature",
      "geometry": {
          "type": "Polygon",
          "coordinates": generatedCoordinates.geometry.coordinates
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

  getAllEventsCoordinatesObject() {
    if (Object.keys(this.props.eventShapes).length > 0) {
      return this.props.eventShapes
    } else {
      return null;
    }
  }

  renderEvents() {
    const event_coord_obj = this.getAllEventsCoordinatesObject();
    let featureCollection = {};
    if (event_coord_obj) {
      let polygons = Object.keys(event_coord_obj).map((ps_id) => this._createNewPolygon(event_coord_obj[ps_id]["parking_space"]["geometry"]["coordinates"], ps_id));

      featureCollection = this._createFeatureCollection(polygons);
    } else {
      featureCollection = GlobalVariables.EMPTY_GEOJSON;
    }

    return (
      <Mapbox.ShapeSource
        id={this.props.type}
        key={this.props.type}
        shape={featureCollection}>
        <Mapbox.FillExtrusionLayer
          id={`fill_${this.props.type}`}
          key={`fill_${this.props.type}`}
          style={lotLayerStyles.events}
        />
      </Mapbox.ShapeSource>
    )
  }

  render() {
    return ( this.renderEvents() )
  }
}

const lotLayerStyles = Mapbox.StyleSheet.create({ // NOTE: On web all shapes have an opacity of 1 barring parking_lot whose opacity is 0.4
  events: {
    fillExtrusionColor: '#FFFF00'
  },
});