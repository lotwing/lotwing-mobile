import React from 'react';
import {
  View,
  Modal,
  Text,
  Picker,
  Platform,
  StyleSheet,
  ActionSheetIOS,
  TouchableWithoutFeedback,
} from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

import Mapbox from '@mapbox/react-native-mapbox-gl';

/**
 *
 * Lot shapes include:
 * parking_lots, buildings, parking_spaces
 */
export default class LotScreen extends React.Component {
  static navigationOptions = {
    header: null,
    title: 'The Lot',
  };

  render() {
  	return (
  		<LotView />
  	);
  }
}

class LotView extends React.Component {
  
  constructor(props) {
      super(props);
      this.state = {
        centerCoordinate:[0, 0],
        lotShapes: null,
        errorLoading: false,
        modalVisible: false,
      }

      this._loadLotView(); // TODO(adwoa): add error handling when fetching data, ....catch(error => { lotview.setState({errorLoading: true, ...})})
      this.onSourceLayerPress = this.onSourceLayerPress.bind(this);
  }

  /**
   * Loads all of the data associated with a lot and updates 
   * the associated state variables, triggering a reload of
   * the lotview.
   */
  _loadLotView() {
    var lotview = this;

    return fetch(GlobalVariables.BASE_ROUTE + Route.FULL_LOT , {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer '+ GlobalVariables.LOTWING_ACCESS_TOKEN,
          },
      })
      .then((response) => response.json())
          .then((responseJson) => {
            GlobalVariables.LOT_DATA = responseJson;

            // TODO(adwoa): ask question about how multiple parking lots are listed and sorted within the get lot response
            lot_geometry = GlobalVariables.LOT_DATA['parking_lots'][0]["geo_info"]["geometry"]
            lot_coords = lot_geometry["coordinates"][0];
           
            // console.log('\n\nPOPULATING LOADED DATA: ');
            lotview.setState({
              centerCoordinate: lotview._calculateCenter(lot_coords),
              lotShapes: GlobalVariables.LOT_DATA,
            });
          });
  }

  _calculateCenter(coord, CENTER_TYPE = 'MAX_MIN') {
    let center_coordinate = [];

    if (CENTER_TYPE == "SIMPLE_AVE") {
      // simple average x and average y of all of the lots coordinates
      let ave_latitude = 0;
      let ave_longitude = 0;
      let num_coordinates = coord.length;

      let center = coord.forEach((point) => {
        ave_latitude += point[0];
        ave_longitude += point[1];
      });

      center_coordinate = [ave_latitude/num_coordinates, ave_longitude/num_coordinates];

    } else if (CENTER_TYPE == "MAX_MIN") {
      // average of the max and min x and y points in the lot
      let max_min_array = [[coord[0][0], coord[0][0]], [coord[0][1], coord[0][1]]]; // [[x_min, x_max], [y_min, y_max]]

      coord.forEach((point) => {
        [px, py] = point;
  
        if (max_min_array[0][0] > px) max_min_array[0][0] = px;
        if (max_min_array[0][1] < px) max_min_array[0][1] = px;
        
        if (max_min_array[1][0] > py) max_min_array[1][0] = py;
        if (max_min_array[1][1] < py) max_min_array[1][1] = py;
      });

      center_coordinate = [max_min_array[0].reduce((a, b) => {return a + b})/2, 
        max_min_array[1].reduce((a, b) => {return a + b})/2];
    }

    return center_coordinate
  }

  /**
   * Launches the tag handler for the object that was pressed.
   * @param e : object returned from the system's onPress handler
   */
  onSourceLayerPress(e) {
    const feature = e.nativeEvent.payload;
    // console.log('\n\nYou pressed a layer here is your feature', feature['id']);
    // console.log('Changing visibility from: ', this.state.modalVisible);
    this.setModalVisible(!this.state.modalVisible);

    // Handle Tag Actions


    if (Platform.OS === 'ios') {
      // console.log('PF: ', Platform.OS, '\n\n');
      // ActionSheetIOS.showActionSheetWithOptions({
      //   options: ['Cancel', 'Remove'],
      //   destructiveButtonIndex: 1,
      //   cancelButtonIndex: 0,
      // },
      // (buttonIndex) => {
      //   if (buttonIndex === 1) { /* destructive action */ }
      // });
    } else {
      // console.log('PF: ', Platform.OS);
    }
  }

  setModalVisible(visibility) {
    this.setState({modalVisible: visibility});
  }

  getLot() {
    // console.log('Running getLot...');
    if (this.state.lotShapes) {
      // console.log('     getLot returning data');
      return this.state.lotShapes['parking_lots'][0]["geo_info"]
    }
    return GlobalVariables.EMPTY_GEOJSON
  }

  getBuildings() {
    // console.log('Running getBuildings...');
    if (this.state.lotShapes){
      // console.log('     getBuildings returning data');
      return this.state.lotShapes['buildings'][0]["geo_info"]
    }  
    return GlobalVariables.EMPTY_GEOJSON
  }

  getAllParkingSpaceShapes() {
    // console.log('Running getAllParkingSpaceShapes..');
    if (this.state.lotShapes) {
      // console.log('     getAllParkingSpaceShapes returning data');
      return this.state.lotShapes['parking_spaces'].map((space) => space["geo_info"])
    }
    return GlobalVariables.EMPTY_GEOJSON
  }

  getAllParkingSpaceCoordinates() {
    // console.log('Running getAllParkingSpaceCoordinates..');
    if (this.state.lotShapes) {
      // console.log('     getAllParkingSpaceCoordinates returning data');
      return this.state.lotShapes['parking_spaces'].map((space) => space["geo_info"]["geometry"]["coordinates"])
    }
    return null
  }

  _createNewPolygon(coordinates, id) {
    const empty_polygon_geojson = {
      "id": id,
      "type": "Feature",
      "geometry": {
          "type": "Polygon",
          "coordinates": coordinates
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

  renderParkingSpaces() {
    const all_parking_space_coordinates = this.getAllParkingSpaceCoordinates();
    const parking_space_shapes = [];

    if (all_parking_space_coordinates) {
      let polygons = all_parking_space_coordinates.map((ps_coordinates, count) => this._createNewPolygon(ps_coordinates, count));
      let featureCollection = this._createFeatureCollection(polygons);

      return (
        <Mapbox.ShapeSource
          id={parking_space_geojson["id"]}
          key={'parking_spaces'}
          onPress={this.onSourceLayerPress}
          shape={featureCollection}>
          <Mapbox.FillLayer
            id ='parking_space_fill'
            key={'parking_spaces_fill'}
            style={lotLayerStyles.parking_spaces} />
       </Mapbox.ShapeSource>
      )
    }

    // console.log('     PARKING SPACES  not  LOADED');
    return parking_space_shapes
  }

  render() {
    return (
      <View style={styles.container}>
        <Modal
            animationType="fade"
            transparent={true}
            visible={this.state.modalVisible}
            onShow={() => {
              // console.log('\nMODAL SHOWING\n');
            }}
            onDismiss={()=> {
              console.log('\nMODAL DISMISSED\n');
              this.setModalVisible(false);
            }}
            onRequestClose={() => {
              console.log('\nMODAL DISMISSED ANDROID\n');
              this.setModalVisible(false);
            }}>

            <TouchableWithoutFeedback 
              style={styles.modalWrapper}
              onPress={() => {
                console.log('TOUCHING --OUTER-- VIEW');
                this.setModalVisible(false);
            }}>
            
              <View 
                style={styles.tagModalInner}
                onPress={() => {console.log('TOUCHING --INNER-- VIEW')}}>

                <Text>This is the view! </Text>
                <Picker
                  selectedValue={this.state.language}
                  style={{ height: 50, width: 100 }}
                  onValueChange={(itemValue, itemIndex) => this.setState({language: itemValue})}>
                  <Picker.Item label="Java" value="java" />
                  <Picker.Item label="JavaScript" value="js" />
                </Picker>

              </View>

            </TouchableWithoutFeedback>
        </Modal>

        <Mapbox.MapView
          centerCoordinate={this.state.centerCoordinate}
          showUserLocation={true}
          style={styles.container}
          styleURL={Mapbox.StyleURL.Street}
          zoomLevel={17}>

          <Mapbox.ShapeSource
            id='parking_lot'
            shape={this.getLot()}>
            <Mapbox.FillLayer
              id='fill_parking_lot'
              style={lotLayerStyles.parking_lot} />
          </Mapbox.ShapeSource>

          <Mapbox.ShapeSource
            id ='buildings'
            shape={this.getBuildings()}>
            <Mapbox.FillLayer
              id ='fill_buildings_lot'
              style={lotLayerStyles.buildings} />
          </Mapbox.ShapeSource>

          {this.renderParkingSpaces()}

        </Mapbox.MapView>

      </View>

    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  modalWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
  }, 
  tagModalInner: {
    flex: 1,
    width: '50%',
    height: '40%',
    flexDirection: 'column',
    backgroundColor: '#2FADED',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

const lotLayerStyles = Mapbox.StyleSheet.create({ // NOTE: On web all shapes have an opacity of 1 barring parking_lot whose opacity is 0.4
  buildings: {
    fillColor: '#FF9933',
    fillOpacity: 0.75,
  },
  empty_parking_spaces: {
    fillColor: '#FFFFFF',
    fillOpacity: 0.75,
  },
  new_vehicle_occupied_spaces: {
    fillColor: '#006699',
    fillOpacity: 0.75,
  },
  parking_lot: {
    fillColor: '#CCCCCC',
   fillOpacity: 1,
  },
  parking_spaces: {
    fillColor: '#FFFFFF',
    fillOpacity: 0.75,
  },
  used_vehicle_occupied_spaces: {
    fillColor: '#66CC00',
    fillOpacity: 0.75,
  },
});

const parking_space_geojson = {
  "id": "parking_spaces",
  "type": "Feature",
  "properties": {},
  "geometry": {
    "coordinates": [],
    "type": "MultiPolygon"
  }
};

const debug_location = [37.353285, -122.0079];