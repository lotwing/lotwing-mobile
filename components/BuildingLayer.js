import React from 'react';
import {
  View,
} from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';

import Mapbox from '@mapbox/react-native-mapbox-gl';
import LotActionHelper from '../helpers/LotActionHelper';

/**
 *
 * Lot shapes include:
 * parking_lots, buildings, parking_spaces
 */
export default class BuildingLayer extends React.Component {
  
  constructor(props) {
      super(props);
      this.renderBuildings = this.renderBuildings.bind(this);
  }

  getAllBuildingCoordinatesObject() {
  	if (Object.keys(this.props.buildingShapes).length > 0) {
      return this.props.buildingShapes
    } else {
    	return null;	
    }
  }

  renderBuildings() {
  	const building_coord_obj = this.getAllBuildingCoordinatesObject();
  	let featureCollection = {};

  	if (building_coord_obj) {
  	  	let polygons = LotActionHelper.createPolygonsFromObject(building_coord_obj);
  	  	featureCollection = LotActionHelper.createFeatureCollection(polygons);
  	} else {
  		featureCollection = GlobalVariables.EMPTY_GEOJSON;
  	}

  	return (
  		<Mapbox.ShapeSource
            id ='buildings'
          	key ='buildings'
            shape={featureCollection}>
            <Mapbox.FillLayer
              id ='fill_buildings_lot'
              key ='fill_buildings_lot'
              style={lotLayerStyles.buildings} />
        </Mapbox.ShapeSource>
    )
  }

  render() {
  	console.log('RENDER CALLED');
  	return (
  		<View>
  			{this.renderBuildings()}
  		</View>
  	)
  }
}

const lotLayerStyles = Mapbox.StyleSheet.create({ // NOTE: On web all shapes have an opacity of 1 barring parking_lot whose opacity is 0.4
  buildings: {
    fillColor: '#FF9933',
    fillOpacity: 0.75,
  },
});