import React from 'react';
import {
  AsyncStorage,
  Image,
  Keyboard,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  TextInput,
  View,
} from 'react-native';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';
import VehicleSpaceLayer from '../components/VehicleSpaceLayer';
import TagModalView from '../components/TagModalView';

import Mapbox from '@mapbox/react-native-mapbox-gl';

import pageStyles from '../constants/PageStyles';
import textStyles from '../constants/TextStyles';

/**
 *
 * Lot shapes include:
 * parking_lots, buildings, parking_spaces
 */
export default class LotScreen extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
  	return (
  		<LotView
        navigation={this.props.navigation} />
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
        parkingShapes: {},
        spaceVehicleMap: {},
        spaceId: 0,
        stockNumber: 0,
        vehicleId: 0,
        year: 0,
        make: 'Nissan',
        model: 'Versa',
        skuCollectorVisible: false,
        stockNumberVehicleMap: {},
        extraVehicleData: {},
      }

      let loadPromise = this._loadLotView(); // TODO(adwoa): add error handling when fetching data, ....catch(error => { lotview.setState({errorLoading: true, ...})})
      loadPromise.then((result) => {
        console.log('PROMISE RESOLVED: ', result);
        if (result && result.name == 'Error') {
          console.log('Routing back to login page!', this.props);
          this.props.navigation.navigate('Auth');
        }
      });

      this.setSKUCollectorVisibility = this.setSKUCollectorVisibility.bind(this);
      this.dismissInput = this.dismissInput.bind(this);
      this.locateVehicleBySKU = this.locateVehicleBySKU.bind(this);
      this.skuEntered = 0;
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
            console.log('\nLOADLOTVIEW RESPONSE: ', responseJson.message, '\n');
            if (responseJson.message == "Signature has expired") {
              console.log('Throwing Error');
              throw Error('Unauthorized user');
            }

            GlobalVariables.LOT_DATA = responseJson;

            // TODO(adwoa): ask question about how multiple parking lots are listed and sorted within the get lot response
            let lot_geometry = GlobalVariables.LOT_DATA['parking_lots'][0]["geo_info"]["geometry"]
            let lot_coords = lot_geometry["coordinates"][0];

            let lotParkingSpaceMap = {};
            GlobalVariables.LOT_DATA['parking_spaces'].forEach((space) => {
              lotParkingSpaceMap[space["id"]] = space;
            });

           console.log('     resetting state: _loadLotView');
            lotview.setState({
              centerCoordinate: lotview._calculateCenter(lot_coords),
              lotShapes: GlobalVariables.LOT_DATA,
              parkingShapes: lotParkingSpaceMap,
            });
          })
          .then(() => lotview._loadParkingSpaceMetadata())
          .catch(err => {
            console.log('CAUHT ERR, attempting logout: ', err, err.name);
            return err
          });
  }

  _loadParkingSpaceMetadata() {
    var lotview = this;

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

            console.log('     resetting state: _loadParkingSpaceMetadata');
            lotview.setState({
              newVehicleSpaces: responseJson["new_vehicle_occupied_spaces"].map((space) => space["id"]),
              usedVehicleSpaces: responseJson["used_vehicle_occupied_spaces"].map((space) => space["id"]),
              emptySpaces: responseJson["empty_parking_spaces"].map((space) => space["id"]),
            });

            console.log('\n\nNEW VEHICLE SPACES: ', this.state.newVehicleSpaces);
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

  unauthorizedError() {
    let err = new Error();
    err.name = 'UnAuthError';

    console.log('ERR: ', err);
    return err
  }

  _signOut(instance, opt_msg) {
    console.log('\n\n SIGNING OUT!\n', this, opt_msg, '\n\n');
    AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
    // this._pushToAuthPage(instance);
  }

  _pushToAuthPage(instance) {
    console.log(instance.props);
    this.props.navigation.navigate('Auth');
  }

  // Modal Visibility controls
  setModalVisibility(visibility) {
    console.log('     resetting state: setModalVisibility');
    this.setState({modalVisible: visibility});
  }

  setVisibility = (value) => {
    this.setModalVisibility(value);
  }

  setModalValues(space_id, stock_number, vehicle_id, year, make, model, extra) {
    this.setState({
      year: year,
      make: make,
      model: model,
      spaceId: space_id,
      vehicleId: vehicle_id,
      stockNumber: stock_number,
      extraVehicleData: extra,
    });
  }

  showAndPopulateModal = (data) => {
    let [space_id, vehicleData] = data;

    if (vehicleData) {
      let vehicle_id = vehicleData['id'];
      let year = vehicleData['year'];
      let make = vehicleData['make'];
      let model = vehicleData['model'];
      let stock_number = vehicleData['stock_number'];

      this.setModalValues(space_id, stock_number, vehicle_id, year, make, model, vehicleData);
      this.setModalVisibility(true);
    }
  }

  dismissInput = () => {
    Keyboard.dismiss();
    this.setSKUCollectorVisibility();
  }

  // Map Data
  getMapCallback = (type, data) => {
    console.log('In Get Map Callback...  ', type);

    let snVehicleMap = this.state.stockNumberVehicleMap;

    if (type == 'new_vehicle' || type == 'used_vehicle') {
      Object.keys(data).forEach((spaceId) => {
        let vehicleData = data[spaceId];
        snVehicleMap[vehicleData["stock_number"]] = vehicleData;
      });
      console.log('NEW STOCK VEHICLE MAP: ', Object.keys(snVehicleMap), '\n\n');
    }

    this.setState({
      stockNumberVehicleMap: snVehicleMap,
    });
  }

  // SKU Collector Visibility controls
  setSKUCollectorVisibility() {
    let visibile = !this.state.skuCollectorVisible;
    this.setState(
      {skuCollectorVisible: visibile});
  }

  getSKUFromInput() {
    return this.skuEntered
  }

  locateVehicleBySKU() {
    // 1. Get the stall where the vehicle is located
    // 2. Navigate the map to that position (mvp optional) TODO (adwoa): add this functionality
    // 3. Open the modal for that stall

    let sku = this.getSKUFromInput();
    let vehicleData = this.state.stockNumberVehicleMap[sku];
    
    console.log('\n\nSKU: ', sku, '\nKeys: ', Object.keys(this.state.stockNumberVehicleMap));

    if (vehicleData) {
      let space_id = vehicleData['id'];
      this.dismissInput();
      this.showAndPopulateModal([space_id, vehicleData]);
    } else { // vehicle not on map
      console.log('Vehicle not on map. Checking server...');
      let vehiclePromise = this._getVehicleBySKU(sku);

      vehiclePromise.then((vehicleData) => {
        if (vehicleData) {

          this.dismissInput();
          this.showAndPopulateModal(['  - -', vehicleData]);
        } else {

          // TODO(adwoa): Display message: no vehicle with that sku number
          // SimpleToast.show(
          //   'SKU not in system',
          //   SimpleToast.SHORT,);
          console.log('NO DATA');
        }
      });
    }
  }

  _getVehicleBySKU(stock_number) {
    console.log('Stock Number Entered: ', stock_number);
    console.log('HITTING ENDPOINT: ', GlobalVariables.BASE_ROUTE + Route.VEHICLE_BY_SKU + stock_number);
    return fetch(GlobalVariables.BASE_ROUTE + Route.VEHICLE_BY_SKU + stock_number , {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer '+ GlobalVariables.LOTWING_ACCESS_TOKEN,
          },
      })
      .then((response) => response.json())
          .then((responseJson) => {
            console.log('VEHICLE PULLED FROM STORE: ', responseJson);
            return responseJson
          })
          .catch(err => {
            return false
          })
  }

  getLot() {
    console.log('     resetting state: getLot');
    if (this.state.lotShapes) {
      return this.state.lotShapes['parking_lots'][0]["geo_info"]
    }
    return GlobalVariables.EMPTY_GEOJSON
  }

  getBuildings() {
    console.log('     resetting state: getBuildings');
    if (this.state.lotShapes){
      return this.state.lotShapes['buildings'][0]["geo_info"]
    }
    return GlobalVariables.EMPTY_GEOJSON
  }

  maybeRenderTextInput() {
    if (this.state.skuCollectorVisible) {
      console.log('SKU COLLECTOR should be visible? ', this.state.skuCollectorVisible);
      return (
        <KeyboardAvoidingView behavior="padding" 
          style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center'}}
          enabled>
          <TouchableWithoutFeedback
            onPress={this.dismissInput}
            accessible={false}>
            <View style={{minHeight: '40%', width: '100%'}}>
            </View>
          </TouchableWithoutFeedback>
           
          <View>
            <View
              style={styles.floatingTextInputArea}>
              <Text
                style={[textStyles.actionSummaryHeader, {color: 'rgba(0, 0, 0, 0.75)'}]}>
                SKU Number</Text>
              <TextInput
                autoCapitalize='characters'
                multiline={false}
                keyboardType='phone-pad'
                style={styles.floatingTextInput}
                onChangeText={(sku) => {this.skuEntered = sku}}
                keyboardType='email-address'/>

              <View
                style={[pageStyles.rightButtonContainer, {width: 270, paddingTop: 5}]}>

                <TouchableOpacity
                  style={buttonStyles.activeSecondaryModalButton}
                  onPress={this.dismissInput}>
                  <Text style={buttonStyles.activeSecondaryTextColor}>
                    CANCEL
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[buttonStyles.activePrimaryModalButton, {borderColor: 'gray', borderWidth: 1}]}
                  onPress={this.locateVehicleBySKU}>
                  <Text style={[buttonStyles.activePrimaryTextColor]}>
                    SEARCH
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableWithoutFeedback
            onPress={this.dismissInput}
            accessible={false}>
            <View style={{minHeight: '40%', width: '100%'}}>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      );
    } else {
      console.log('NOT RENDERING TEXT INPUT');
      return
    }
  }

  render() {
    console.log('+ + + Render Lot Screen');
      // <View style={styles.container}>
      // not position
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container} enabled>
        <StatusBar
          barStyle='light-content'
          backgroundColor='#BE1E2D'/>

        <Modal
          animationType='slide'
          transparent={true}
          visible={this.state.modalVisible}>
   
          <TagModalView
            spaceId={this.state.spaceId}
            vehicleId={this.state.vehicleId}
            stockNumber={this.state.stockNumber}
            year={this.state.year}
            make={this.state.make}
            model={this.state.model}
            extraVehicleData={this.state.extraVehicleData}
            style={styles.tagModalInnerView}
            modalStyling={styles.tagModalStyles}
            navigation={this.props.navigation}
            setModalVisibility={this.setVisibility} />
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
            ids={this.state.emptySpaces}
            style={lotLayerStyles.empty_parking_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.emptySpaces}
            setModalVisibility={this.setModalVisibility}
            sendMapCallback={this.getMapCallback}
            type='empty'>
          </VehicleSpaceLayer>

          <VehicleSpaceLayer
            ids={this.state.newVehicleSpaces}
            style={lotLayerStyles.new_vehicle_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.newVehicleSpaces}
            showAndPopulateModal={this.showAndPopulateModal}
            sendMapCallback={this.getMapCallback}
            type='new_vehicle'>
          </VehicleSpaceLayer>

          <VehicleSpaceLayer
            ids={this.state.usedVehicleSpaces}
            style={lotLayerStyles.used_vehicle_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.usedVehicleSpaces}
            showAndPopulateModal={this.showAndPopulateModal}
            sendMapCallback={this.getMapCallback}
            type='used_vehicle'>
          </VehicleSpaceLayer>

        </Mapbox.MapView>


        <TouchableOpacity
          style={styles.floatingActionButton}
          onPress={this.setSKUCollectorVisibility}>
          <Image
            source={require('../assets/images/search-solid.png')}
            style={styles.searchIconSizing}/>
        </TouchableOpacity>

        {this.maybeRenderTextInput()}

      </KeyboardAvoidingView>

    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  modalWrapper: {
    flex: 10,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    width: '100%',
    height: '100%',
    alignItems: 'stretch',
  }, 
  searchIconSizing: {
    width: 30,
    resizeMode: 'contain',
  },
  floatingActionButton: {
    position:'absolute',
    right: 30, 
    bottom: 80,
    width: 66, 
    height: 66,
    backgroundColor: '#828282', 
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#828282',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 20,
  },
  floatingTextInputArea: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#828282',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 20,
  },
  floatingTextInput: {
    backgroundColor: 'white',
    borderBottomColor: 'gray',
    borderColor: 'white',
    fontSize: 18,
    borderWidth: 1,
    height: 50,
    margin: 10,
    padding: 5,
    width: 260,
  },
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