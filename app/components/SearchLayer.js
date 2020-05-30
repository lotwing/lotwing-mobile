import React from 'react';
import { StyleSheet, Text } from 'react-native';

import Mapbox from '@react-native-mapbox-gl/maps';

export default class SearchLayer extends React.Component {
  constructor(props) {
    super(props);
  }

  renderHighlight() {
    if (this.props.searchStallPolygon !== null) {
      //console.log('~ ~ ~ RENDERING CLICKED STALL');
      return (
        <Mapbox.ShapeSource
          id="searchVehicle"
          key="searchVehicle"
          shape={this.props.searchStallPolygon}>
          <Mapbox.LineLayer
            id="search_highlight"
            key="search_highlight"
            style={styles.highlight_style}
          />
        </Mapbox.ShapeSource>
      );
    } else {
      //console.log('~ ~ ~ NOT RENDERING CLICKED STALL');
      return <></>;
    }
  }

  render() {
    return this.renderHighlight();
  }
}

const styles = {
  highlight_style: {
    lineWidth: 2,
    lineColor: '#BE1E2D',
  },
};
