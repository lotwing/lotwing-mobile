import React from 'react';
import { StyleSheet, Text } from 'react-native';

import Mapbox from '@react-native-mapbox-gl/maps';

export default class VehicleHighlightLayer extends React.Component {
  constructor(props) {
    super(props);
  }

  renderHighlight() {
    if (this.props.clickedStallPolygon) {
      //console.log('~ ~ ~ RENDERING CLICKED STALL');
      return (
        <Mapbox.ShapeSource
          id="highlightedVehiclie"
          key="highlightedVehiclie"
          shape={this.props.clickedStallPolygon}>
          <Mapbox.FillLayer
            id="parking_space_highlight"
            key="parking_space_highlight"
            style={styles.highlight_style}
          />
        </Mapbox.ShapeSource>
      );
    } else {
      //console.log('~ ~ ~ NOT RENDERING CLICKED STALL');
      return [];
    }
  }

  render() {
    return this.renderHighlight();
  }
}

const styles = {
  highlight_style: {
    fillColor: '#FEC62E',
    fillOpacity: 0.9,
  },
};
