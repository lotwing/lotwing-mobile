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
import VehicleSpaceLayer from '../components/VehicleSpaceLayer'

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
        newVehicleSpaces: [],
        usedVehicleSpaces: [],
        emptySpaces: [],
        spaceVehicleMap: {},
      }

      this._loadLotView(); // TODO(adwoa): add error handling when fetching data, ....catch(error => { lotview.setState({errorLoading: true, ...})})
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
           
            lotview.setState({
              centerCoordinate: lotview._calculateCenter(lot_coords),
              lotShapes: GlobalVariables.LOT_DATA,
            });
          })
          .then(() => lotview._loadParkingSpaceMetadata());
  }

  _loadParkingSpaceMetadata() {
    var vehicleSpaceLayer = this;

    return fetch(GlobalVariables.BASE_ROUTE + Route.PARKING_SPACE_METADATA , {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer '+ GlobalVariables.LOTWING_ACCESS_TOKEN,
          },
      })
      .then((response) => response.json())
          .then((responseJson) => { // only saying space ids not saving most_recently_tagged_at which is also returned
            console.log('\nRETURNED SPACE METADATA\n     Number of spaces by type: new, used, empty\n       ', responseJson["new_vehicle_occupied_spaces"].length, responseJson["used_vehicle_occupied_spaces"].length, responseJson["empty_parking_spaces"].length);

            vehicleSpaceLayer.setState({
              newVehicleSpaces: responseJson["new_vehicle_occupied_spaces"].map((space) => space["id"]),
              usedVehicleSpaces: responseJson["used_vehicle_occupied_spaces"].map((space) => space["id"]),
              emptySpaces: responseJson["empty_parking_spaces"].map((space) => space["id"]),
            });

            console.log('NEW VEHICLE SPACES: ', this.state.newVehicleSpaces);
            console.log('USED VEHICLE SPACES: ', this.state.usedVehicleSpaces);

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

  setModalVisible(visibility) {
    this.setState({modalVisible: visibility});
  }

  getLot() {
    if (this.state.lotShapes) {
      return this.state.lotShapes['parking_lots'][0]["geo_info"]
    }
    return GlobalVariables.EMPTY_GEOJSON
  }

  getBuildings() {
    if (this.state.lotShapes){
      return this.state.lotShapes['buildings'][0]["geo_info"]
    }  
    return GlobalVariables.EMPTY_GEOJSON
  }

  render() {
    return (
      <View style={styles.container}>
        <Modal
            animationType="fade"
            transparent={true}
            visible={this.state.modalVisible}
            onShow={() => {
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

          <VehicleSpaceLayer
            ids={this.state.newVehicleSpaces}
            style={lotLayerStyles.new_vehicle_occupied_spaces}
            lotShapes={this.state.lotShapes}
            spaces={this.state.newVehicleSpaces}
            type='new_vehicle'/>

          <VehicleSpaceLayer
            ids={this.state.usedVehicleSpaces}
            style={lotLayerStyles.used_vehicle_occupied_spaces}
            lotShapes={this.state.lotShapes}
            spaces={this.state.usedVehicleSpaces}
            type='used_vehicle'/>

          <VehicleSpaceLayer
            ids={this.state.emptySpaces}
            style={lotLayerStyles.empty_parking_spaces}
            lotShapes={this.state.lotShapes}
            spaces={this.state.emptySpaces}
            type='empty'/>

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
    backgroundColor: 'red',
    borderWidth: 2,
    borderColor: 'blue',
    justifyContent: 'center',
    alignItems: 'stretch',
  }, 
  tagModalInner: {
    flex: 1,
    width: '50%',
    height: '100%',
    flexDirection: 'column',
    backgroundColor: 'white',
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

const debug_location = [37.353285, -122.0079];