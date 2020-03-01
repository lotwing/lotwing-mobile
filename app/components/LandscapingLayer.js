import React from 'react';
import { StyleSheet, View } from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';

import Mapbox from '@react-native-mapbox-gl/maps';
import LotActionHelper from '../helpers/LotActionHelper';

/**
 *
 * Lot shapes include:
 * parking_lots, buildings, parking_spaces
 */
export default class LandscapingLayer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.renderLandscapes = this.renderLandscapes.bind(this);
  }

  getAllLandscapesCoordinatesObject() {
    if (Object.keys(this.props.landscapingShapes).length > 0) {
      return this.props.landscapingShapes;
    } else {
      return null;
    }
  }

  renderLandscapes() {
    const landscaping_coord_obj = this.getAllLandscapesCoordinatesObject();
    let featureCollection = {};
    /*
      Flag to get around issue with ShapeSource dynamic updating
      https://github.com/react-native-mapbox-gl/maps/issues/248
    */
    let populated = false;
    if (landscaping_coord_obj) {
      let polygons = LotActionHelper.createPolygonsFromObject(
        landscaping_coord_obj,
      );
      populated = true;
      featureCollection = LotActionHelper.createFeatureCollection(polygons);
    } else {
      featureCollection = GlobalVariables.EMPTY_GEOJSON;
    }

    return populated ? (
      <Mapbox.ShapeSource
        id="landscaping"
        key="landscaping"
        shape={featureCollection}>
        <Mapbox.FillLayer
          id="fill_landscaping_lot"
          key="fill_landscaping_lot"
          style={lotLayerStyles.landscape}
        />
      </Mapbox.ShapeSource>
    ) : (
      <></> // See above comment
    );
  }

  render() {
    return this.renderLandscapes();
  }
}

const lotLayerStyles = {
  // NOTE: On web all shapes have an opacity of 1 barring parking_lot whose opacity is 0.4
  landscape: {
    fillColor: '#067C3E',
    fillOpacity: 1,
  },
};
