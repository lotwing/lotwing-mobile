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
export default class HoldsLayer extends React.PureComponent {

  constructor(props) {
      super(props);
      this.state = { loading: true }
      this.renderHolds = this.renderHolds.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    this.setState({loading: true})
  }
  _createNewPolygon(coordinates, id) {
    let left = coordinates[0][0][0]
    let right = coordinates[0][0][0]
    let top = coordinates[0][0][1]
    let bottom = coordinates[0][0][1]

    coordinates[0].forEach((pair) => {
      if (pair[0] < left) { left = pair[0] };
      if (pair[0] > right) { right = pair[0] };
      if (pair[1] < bottom) { bottom = pair[1] };
      if (pair[1] > top) { top = pair[1] };
    })
    //console.log(left, right, top, bottom)
    const h = left + ((right - left)/2)
    const v = bottom + ((top - bottom)/2)
    const scale = 0.0000018;
    const armLength = scale*3
    //console.log(coordinates)
    //const updatedCoordinates = [horizontalCoords, verticalCoords]
    let generatedCoordinates = []
    if (this.props.type === 'service_hold') {
      generatedCoordinates = [
        [
          [
            [h, v+(armLength/1.5)],
            [h-armLength, v-(armLength/1.5)],
            [h+armLength, v-(armLength/1.5)],
            [h, v+(armLength/1.5)],
          ]
        ]
      ]
    } else {
      generatedCoordinates = [
        [
          [
            [h+scale, v+scale],
            [h-scale, v+scale],
            [h-scale, v+armLength],
            [h-armLength, v+armLength],
            [h-armLength, v-armLength],
            [h-scale, v-armLength],
            [h-scale, v-scale],
            [h+scale, v-scale],
            [h+scale, v-armLength],
            [h+armLength, v-armLength],
            [h+armLength, v+armLength],
            [h+scale, v+armLength],
            [h+scale, v+scale]
          ]
        ]
      ]

    }
    const empty_polygon_geojson = {
      "id": id,
      "type": "Feature",
      "geometry": {
          "type": "MultiPolygon",
          "coordinates": generatedCoordinates
        }
    };
    return empty_polygon_geojson;
  }

  _createFeatureCollection(list_of_features) {
    return ({
      "type": "FeatureCollection",
      "features": list_of_features
    })
  }

  getAllHoldsCoordinatesObject() {
    if (this.props.spaces.length > 0) {
      this.setState({loading: false})
      let coordinatesObject = {};
      this.props.spaces.forEach((id) => {
        if (!this.props.skip.some(skipId => skipId === id )) {
          coordinatesObject[id] = this.props.parkingShapes[id]["geo_info"]["geometry"]["coordinates"];
        }
      });
      return coordinatesObject
    }
    return null
  }

  renderHolds() {
    const ps_coord_obj = this.getAllHoldsCoordinatesObject();
    let featureCollection = {};
    if (ps_coord_obj) {
      let polygons = Object.keys(ps_coord_obj)
        .map((ps_id) => this._createNewPolygon(ps_coord_obj[ps_id], ps_id));
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
            style={this.props.type === 'service_hold' ? lotLayerStyles.serviceHold : lotLayerStyles.salesHold }
          />
        </Mapbox.ShapeSource>
      )
    }
    return null
  }

  render() {
    return ( this.renderHolds() )
  }
}

const lotLayerStyles = Mapbox.StyleSheet.create({ // NOTE: On web all shapes have an opacity of 1 barring parking_lot whose opacity is 0.4
  serviceHold: {
    fillExtrusionColor: '#FFA500'
  },
  salesHold: {
    fillExtrusionColor: '#FFFFFF'
  },
});