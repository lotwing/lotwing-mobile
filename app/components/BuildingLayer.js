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
export default class BuildingLayer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.renderBuildings = this.renderBuildings.bind(this);
  }

  getAllBuildingCoordinatesObject() {
    if (Object.keys(this.props.buildingShapes).length > 0) {
      return this.props.buildingShapes;
    } else {
      return null;
    }
  }

  renderBuildings() {
    const building_coord_obj = this.getAllBuildingCoordinatesObject();
    let featureCollection = {};
    /* 
      Flag to get around issue with ShapeSource dynamic updating
      https://github.com/react-native-mapbox-gl/maps/issues/248
    */
    let populated = false;
    if (building_coord_obj) {
      let polygons = LotActionHelper.createPolygonsFromObject(
        building_coord_obj,
      );
      populated = true;
      featureCollection = LotActionHelper.createFeatureCollection(polygons);
    } else {
      featureCollection = GlobalVariables.EMPTY_GEOJSON;
    }

    return populated ? (
      <Mapbox.ShapeSource
        id="buildings"
        key="buildings"
        shape={featureCollection}>
        <Mapbox.FillLayer
          id="fill_buildings_lot"
          key="fill_buildings_lot"
          style={lotLayerStyles.buildings}
        />
      </Mapbox.ShapeSource>
    ) : (
      <></> // See above comment
    );
  }

  render() {
    return this.renderBuildings();
  }
}

const lotLayerStyles = {
  // NOTE: On web all shapes have an opacity of 1 barring parking_lot whose opacity is 0.4
  buildings: {
    fillColor: '#FF9933',
    fillOpacity: 0.75,
  },
};
