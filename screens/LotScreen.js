import React from 'react';
import {
  ActivityIndicator,
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
import VehicleHighlightLayer from '../components/VehicleHighlightLayer';
import BuildingLayer from '../components/BuildingLayer';
import EventsLayer from '../components/EventsLayer';
import TagModalView from '../components/TagModalView';
import ClickToPopulateViewHandler from '../components/ClickToPopulateViewHandler';
import ActionFeedbackView from '../components/ActionFeedbackView';
import LotActionHelper from '../helpers/LotActionHelper';

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
        duplicateSpaces: [],
        loanerSpaces: [],
        leaseSpaces: [],
        wholesaleSpaces: [],
        driveEventSpaces: [],
        fuelEventSpaces: [],
        parkingShapes: {},
        spaceVehicleMap: {},
        spaceId: 0,
        vehicles: [],
        vehicleId: 0,
        modalType: GlobalVariables.BASIC_MODAL_TYPE,
        skuCollectorVisible: false,
        skuSearchFailed: false,
        stockNumberVehicleMap: {},
        extraVehicleData: {},
        clickToPopulateStall: null,
        clickedStall: null,
        feedbackText: 'Populating space...',
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
      this.setVehicleHighlight = this.setVehicleHighlight.bind(this);
      this.dismissInput = this.dismissInput.bind(this);
      this.locateVehicleBySKU = this.locateVehicleBySKU.bind(this);
      this.skuEntered = 0;
      this._loadLotView = this._loadLotView.bind(this);
      this.updateSpaceVehicleMap = false;

  }

  /**
   * Loads all of the data associated with a lot and updates
   * the associated state variables, triggering a reload of
   * the lotview.
   */
  componentWillReceiveProps(nextProps) {
    if (nextProps.navigation.state && nextProps.navigation.state.params.refresh) {
      console.log('REFRESHING LOT')
      this.updateSpaceVehicleMap = true;
      return this._loadLotView();
    }
  }
  _loadLotView() {
    var lotview = this;
    console.log('* * * * * LOAD LOT VIEW * * * * *');
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
      lotview._loadEvents();
      lotview._loadParkingSpaceMetadata({
        centerCoordinate: lotview._calculateCenter(lot_coords),
        parkingShapes: lotParkingSpaceMap,
      })
    })
    .catch(err => {
      console.log('CAUGHT ERR, attempting logout: ', err, err.name);
      return err
    });
  }
  _loadParkingSpaceMetadata({ centerCoordinate, parkingShapes }) {
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
      lotview.setState({
        newVehicleSpaces: responseJson["new_vehicle_occupied_spaces"].map((space) => space["id"]),
        usedVehicleSpaces: responseJson["used_vehicle_occupied_spaces"].map((space) => space["id"]),
        emptySpaces: responseJson["empty_parking_spaces"].map((space) => space["id"]),
        duplicateSpaces: responseJson["duplicate_parked_spaces"].map((space) => space["id"]),
        loanerSpaces: responseJson["loaner_occupied_spaces"].map((space) => space["id"]),
        leaseSpaces: responseJson["lease_return_occupied_spaces"].map((space) => space["id"]),
        wholesaleSpaces: responseJson["wholesale_unit_occupied_spaces"].map((space) => space["id"]),
        centerCoordinate,
        lotShapes: GlobalVariables.LOT_DATA,
        parkingShapes,
        errorLoading: false,
        modalVisible: false,
        spaceVehicleMap: {},
        spaceId: 0,
        vehicles: [],
        vehicleId: 0,
        modalType: GlobalVariables.BASIC_MODAL_TYPE,
        skuCollectorVisible: false,
        skuSearchFailed: false,
        stockNumberVehicleMap: {},
        extraVehicleData: {},
        clickToPopulateStall: null,
        clickedStall: null,
        feedbackText: '',
      });
      this.updateSpaceVehicleMap = false;
    });
  }
  _loadEvents() {
    var lotview = this;

    return fetch(GlobalVariables.BASE_ROUTE + Route.EVENTS , {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer '+ GlobalVariables.LOTWING_ACCESS_TOKEN,
        },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      lotview.setState({
        driveEventSpaces: responseJson["test_drive_events"].map((space) => space.data.attributes),
        fuelEventSpaces: responseJson["fuel_vehicle_events"].map((space) => space.data.attributes),
      })
    })
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


  setVisibility = (value, opt_modalType, opt_currVehicleId) => {
    this.setModalVisibility(value, opt_modalType, opt_currVehicleId);
  }
  setModalId = (id, vehicleArray) => {
    console.log('Lot View Vehicle ID: ', id)
    this.state.vehicleId !== id && this.setState({ vehicleId: id, vehicles: vehicleArray })
  }

  // Modal Visibility controls
  setModalVisibility(visibility, modalType = null, vehicleId = null, opt_basic_modal_action_fb_msg = null) {
    // let clickedStallValue = visibility ? this.state.clickedStall : null;
    // console.log('\n* * * *   show clicked stall? ', clickedStallValue, '\n\n\n');
    console.log('Set modal visibility')
    if (modalType !== null) {
      let textToShow = null
      if (modalType == GlobalVariables.CHOOSE_EMPTY_SPACE) {
        textToShow = 'Choose the stall to populate...';
        console.log('Should populate VEHICLE ', this.state.vehicleId);
      } else if (modalType == GlobalVariables.ACTION_FEEDBACK_MODAL_TYPE && visibility == false && opt_basic_modal_action_fb_msg) {
        textToShow = opt_basic_modal_action_fb_msg;
      }
      this.setState({modalVisible: visibility, modalType: modalType, feedbackText: textToShow});
    } else {
      this.setState({modalVisible: visibility, modalType: GlobalVariables.BASIC_MODAL_TYPE});
    }
  }

  setPopulateViewVisibility(visibility, modalType = null, vehicleId = null) {
    this.setState({modalVisible: visibility, modalType: modalType, feedbackText: textToShow});
  }


  updateLotAndDismissModal = (new_stall, vehicleId = null, sku_number = null, opt_feedbackMsg = null) => {
    // 1. Remove Vehicle  Highlight
    console.log('updateLotAndDismissModal')
    this.setVehicleHighlight(null);

    // 2. Dismiss Modal & Show Loading Feedback
    this.setModalVisibility(false, GlobalVariables.ACTION_FEEDBACK_MODAL_TYPE, null, opt_feedbackMsg);

    // 3. Update Stall Number & Fetch Updated Lot
    // TODO(adwoa): make this process faster. We should be
    // doing single space updates and listening for other
    // parking space change actions continuously so that this
    // does not require an entire lot reload
    if (vehicleId) {
      console.log('VEHICLE ID ENTERED: updating');
      let stallUpdatedPromise = this.updateStallNumber(new_stall, vehicleId);

      stallUpdatedPromise.then((result) => {
        console.log('STALL UPDATE RESULT: ', result);
        // 3. Re-render lot by updating state
        this.updateSpaceVehicleMap = true;
        return this._loadLotView();
      })

    } else if (sku_number) {
      console.log('SKU ENTERED: updating');
      let vehiclePromise = this._getVehicleBySKU(sku_number);

      vehiclePromise.then((vehicleData) => {
        return this.updateStallNumber(new_stall, vehicleData['id'])
      }).then((result) => {
        console.log('STALL UPDATE RESULT: ', result);
        // 3. Re-render lot by updating state
        this.updateSpaceVehicleMap = true;
        return this._loadLotView();
      })
    } else {
      this.updateSpaceVehicleMap = true;
      return this._loadLotView();
    }

  }

  updateStallNumber(new_stall, vehicleId) {
    let newSpaceData = {spaceId: new_stall, vehicleId: vehicleId};
    let space_data = LotActionHelper.structureTagPayload('change_stall', newSpaceData, 'Moved vehicle to stall ' + new_stall);

    console.log('\n\nSPACE DATA: ', space_data);
    console.log('vehicle id: ', vehicleId,' == ', this.state.vehicleId);
    console.log('old space id: ', this.state.spaceId);
    console.log('new space id: ', new_stall);
    console.log('sku number: ', this.state.stockNumber);

    return fetch(GlobalVariables.BASE_ROUTE + Route.TAG_VEHICLE , {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+ GlobalVariables.LOTWING_ACCESS_TOKEN,
        },
        body: JSON.stringify(space_data),
      })
      .then((response) => {
        return response.json();
      })
      .then((responseJson) => {
        //console.log(responseJson);
        return responseJson
      })
      .catch(err => {
        console.log('\nCAUGHT ERROR: \n', err, err.name);
        //TODO(adwoa): make save button clickable again
        return err
      });
  }

  setModalValues(modal_type, space_id, vehiclesArray) {
    // IF stall is empty only space_id needed
    if (modal_type == GlobalVariables.EMPTY_MODAL_TYPE) {
      if (!space_id) {
        throw Error('No space id was passed to display the empty tag modal');
      }
    }
    // IF stall is populated pass all data barring extra which is optional
    if (space_id === null ) {
      // special case where we don't have a space id
      this.setState({ vehicles: vehiclesArray })
    }

    this.setState({
      spaceId: space_id,
    });
  }

  setVehicleHighlight(polygonClicked) {
    this.setState({clickedStall: polygonClicked});
  }

  showAndPopulateModal = (data, polygonClicked) => {
    let [space_id, vehicleData] = data;

    // Highlight selected stall
    // 1. Pass polygon clicked or searched for here in order to highlight
    if (polygonClicked) {
      this.setVehicleHighlight(polygonClicked);
    } else {
      this.setVehicleHighlight(null);
    }
    // Display Proper Modal and Highlight selected stall
    if (this.state.modalType != GlobalVariables.CHOOSE_EMPTY_SPACE) {
      if (vehicleData && vehicleData == GlobalVariables.EMPTY_MODAL_TYPE) {
        console.log('\n\nEmpty Modal');
        // show empty modal
        this.setModalValues(GlobalVariables.EMPTY_MODAL_TYPE, space_id);
        this.setModalVisibility(true, GlobalVariables.EMPTY_MODAL_TYPE);

      } else if (vehicleData === null ) {
        console.log('Extra data not empty: ', space_id);
        let vehiclesArray = [];
        //let vehicle_id = vehicleData['id'];
        //let year = vehicleData['year'];
        //let make = vehicleData['make'];
        //let model = vehicleData['model'];
        //let stock_number = vehicleData['stock_number'];

        this.setModalValues(GlobalVariables.BASIC_MODAL_TYPE, space_id, vehiclesArray);
        this.setModalVisibility(true);
      } else if (space_id === null ) {
        this.setModalValues(GlobalVariables.BASIC_MODAL_TYPE, space_id, vehicleData);
        this.setModalVisibility(true);
      } else {
        console.log('DATA MISSING: ', vehicleData)

      }
    } else {
      // Show Add Vehicle to highlighted space message
      this.populateStall(space_id);
    }
  }

  populateStall(space_id) {
    if (space_id) {
      this.setState({clickToPopulateStall: space_id, feedbackText: 'Populating stall '+ space_id+'...'});

      console.log(' - - - - - IN UPDATE LOT AND DISMISS ON CLICK POPULATE VIEW');
      console.log('VEHICLE ID: ', this.state.vehicleId);
      // 2. Update Stall Number & Fetch updated lot
      // TODO(adwoa): make this process faster. We should be
      // doing single space updates and listening for other
      // parking space change actions continuously so that this
      // does not require an entier lot reload
      if (this.state.vehicleId) {
        console.log('VEHICLE ID ENTERED: updating');
        let stallUpdatedPromise = this.updateStallNumber(space_id, this.state.vehicleId);

        stallUpdatedPromise.then((result) => {
          //console.log('STALL UPDATE RESULT: ', result);
          // 3. Re-render lot by updating state
          this.updateSpaceVehicleMap = true;
          return this._loadLotView();
        })
      }

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
        // console.log('SPACE QUERIED: ', spaceId);
        let vehicleData = data[spaceId];

        if (vehicleData) {
          vehicleData['shape_id'] = spaceId;
          snVehicleMap[vehicleData["stock_number"]] = vehicleData;
        }
      });
      // console.log('NEW STOCK VEHICLE MAP: ', Object.keys(snVehicleMap), '\n\n');
    }

    this.setState({
      stockNumberVehicleMap: snVehicleMap,
    });
  }
  // SKU Collector Visibility controls
  setSKUCollectorVisibility() {
    let visibile = !this.state.skuCollectorVisible;
    this.setState({
      skuCollectorVisible: visibile,
      skuSearchFailed: false,
    });
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
      let space_id = vehicleData['shape_id'].toString();
      this.dismissInput();
      this.showAndPopulateModal([space_id, null]);
    } else {
      console.log('Vehicle not currently on the map. Checking server...');
      let vehiclePromise = this._getVehicleBySKU(sku);

      vehiclePromise.then((vehicleData) => {
        if (vehicleData) {
          let tempVehicles = []
          tempVehicles.push(vehicleData)
          this.dismissInput();
          this.showAndPopulateModal([null, tempVehicles]);
        } else {
          // Display sku location failure text within search modal
          this.setState({
            skuSearchFailed: true,
          });
        }
      });
    }
  }

  _getVehicleBySKU(stock_number) {
    // console.log('Stock Number Entered: ', stock_number);
    // console.log('HITTING ENDPOINT: ', GlobalVariables.BASE_ROUTE + Route.VEHICLE_BY_SKU + stock_number);
    return fetch(GlobalVariables.BASE_ROUTE + Route.VEHICLE_BY_SKU + stock_number , {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer '+ GlobalVariables.LOTWING_ACCESS_TOKEN,
          },
      })
      .then((response) => response.json())
          .then((responseJson) => {
            console.log('VEHICLE PULLED FROM STORE: ', responseJson['vin']);
            return responseJson
          })
          .catch(err => {
            return false
          })
  }

  getLot() {
    if (this.state.lotShapes) {
      return this.state.lotShapes['parking_lots'][0]["geo_info"]
    }
    return GlobalVariables.EMPTY_GEOJSON
  }


  getBuildings() {
    let buildingMap = {};
    if (this.state.lotShapes){
      this.state.lotShapes['buildings'].forEach((shape) => {
        buildingMap[shape["id"]] = shape;
      });
    }
    return buildingMap
  }

  maybeRenderSearchButton() {
    if (this.state.modalType != GlobalVariables.CHOOSE_EMPTY_SPACE) {
      return (
        <TouchableOpacity
          style={styles.floatingActionButton}
          onPress={this.setSKUCollectorVisibility}>
          <Image
            source={require('../assets/images/search-solid.png')}
            style={styles.searchIconSizing}/>
        </TouchableOpacity>
        )
    }
  }

  maybeRenderTextInput() {
    if (this.state.skuCollectorVisible) {
      // console.log('SKU COLLECTOR should be visible? ', this.state.skuCollectorVisible);
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
                Stock Number</Text>
              <TextInput
                autoCapitalize='characters'
                multiline={false}
                returnKeyType='search'
                style={[styles.floatingTextInput, {color: 'rgba(0, 0, 0, 0.75)'}]}
                onChangeText={(sku) => {this.skuEntered = sku}}
                onSubmitEditing={(event) => this.locateVehicleBySKU()}
                autoFocus={true}/>

              <Text
                style={[textStyles.actionSummaryText, {color: '#BE1E2D', fontSize: 10, marginLeft: 10, paddingBottom: 5}]}>
                {this.state.skuSearchFailed ? 'Vehicle not found. Please try another stock number.' : ''}</Text>

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
      return
    }
  }

  _renderTagModal() {
    console.log('Render Tag Modal View: ', this.state.modalType);
    let stockNumberToDisplay = this.state.modalType == GlobalVariables.BASIC_MODAL_TYPE ? this.state.stockNumber : null;
    return (
      <Modal
        animationType='slide'
        transparent={true}
        visible={this.state.modalVisible}>

        <TagModalView
          modalType={this.state.modalType}
          spaceId={this.state.spaceId}
          vehicles={this.state.vehicles}
          style={styles.tagModalInnerView}
          modalStyling={styles.tagModalStyles}
          navigation={this.props.navigation}
          setModalVisibility={this.setVisibility}
          setVehicleId={this.setModalId}
          updateLotAndDismissModal={this.updateLotAndDismissModal}
          setVehicleHighlight={this.setVehicleHighlight} />
      </Modal>
      )
  }

  maybeRenderPopulateOnClick() {
    // console.log('\n\n\n\nModal Type: ', this.state.modalType);
    if (this.state.modalType == GlobalVariables.CHOOSE_EMPTY_SPACE) {
      console.log('Render Populate Space View');
      return (
        <ClickToPopulateViewHandler
          navigation={this.props.navigation}
          setModalVisibility={this.setVisibility}
          updateLotAndDismissModal={this.updateLotAndDismissOnClickPopulateView}
          clickToPopulateVehicleId={this.state.vehicleId}
          clickToPopulateStall={this.state.clickToPopulateStall}
          feedbackText={this.state.feedbackText} />
        )
    }
  }

  maybeRenderActionFeedbackView() {
    if (this.state.modalType == GlobalVariables.ACTION_FEEDBACK_MODAL_TYPE && this.state.modalVisible == false) {
      return (
        <ActionFeedbackView
          feedbackText={this.state.feedbackText} />
      )
    }
  }

  render() {
    console.log('\n\n\n+ + + Render Lot Screen + + +');
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container} enabled>
        <StatusBar
          barStyle='light-content'
          backgroundColor='#BE1E2D'/>

        {this._renderTagModal()}

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

          <BuildingLayer
            buildingShapes={this.getBuildings()}>
          </BuildingLayer>

          <VehicleSpaceLayer
            ids={this.state.emptySpaces}
            style={lotLayerStyles.empty_parking_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.emptySpaces}
            showAndPopulateModal={this.showAndPopulateModal}
            setModalVisibility={this.setModalVisibility}
            sendMapCallback={this.getMapCallback}
            updateSpaceVehicleMap={false}
            updateEvents={this.postLoadEvents}
            type='empty'
            recent={false}>
          </VehicleSpaceLayer>

          <VehicleSpaceLayer
            ids={this.state.newVehicleSpaces}
            style={lotLayerStyles.new_vehicle_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.newVehicleSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            type='new_vehicle'
            recent={false}>
          </VehicleSpaceLayer>

          <VehicleSpaceLayer
            ids={this.state.newVehicleSpaces}
            style={lotLayerStyles.new_vehicle_recent_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.newVehicleSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            type='new_vehicle'
            recent={true}>
          </VehicleSpaceLayer>

          <VehicleSpaceLayer
            ids={this.state.usedVehicleSpaces}
            style={lotLayerStyles.used_vehicle_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.usedVehicleSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            type='used_vehicle'
            recent={false}>
          </VehicleSpaceLayer>

          <VehicleSpaceLayer
            ids={this.state.usedVehicleSpaces}
            style={lotLayerStyles.used_vehicle_recent_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.usedVehicleSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            updateEvents={this.postLoadEvents}
            type='used_vehicle'
            recent={true}>
          </VehicleSpaceLayer>

          <VehicleSpaceLayer
            ids={this.state.loanerSpaces}
            style={lotLayerStyles.loaner_recent_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.loanerSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            updateEvents={this.postLoadEvents}
            type='loaner_vehicle'
            recent={true}>
          </VehicleSpaceLayer>

          <VehicleSpaceLayer
            ids={this.state.loanerSpaces}
            style={lotLayerStyles.loaner_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.loanerSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            updateEvents={this.postLoadEvents}
            type='loaner_vehicle'
            recent={false}>
          </VehicleSpaceLayer>

          <VehicleSpaceLayer
            ids={this.state.leaseSpaces}
            style={lotLayerStyles.lease_recent_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.leaseSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            updateEvents={this.postLoadEvents}
            type='lease_vehicle'
            recent={true}>
          </VehicleSpaceLayer>

          <VehicleSpaceLayer
            ids={this.state.leaseSpaces}
            style={lotLayerStyles.lease_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.leaseSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            updateEvents={this.postLoadEvents}
            type='lease_vehicle'
            recent={false}>
          </VehicleSpaceLayer>

          <VehicleSpaceLayer
            ids={this.state.wholesaleSpaces}
            style={lotLayerStyles.wholesale_recent_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.wholesaleSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            updateEvents={this.postLoadEvents}
            type='wholesale_vehicle'
            recent={true}>
          </VehicleSpaceLayer>

          <VehicleSpaceLayer
            ids={this.state.wholesaleSpaces}
            style={lotLayerStyles.wholesale_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.wholesaleSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            updateEvents={this.postLoadEvents}
            type='wholesale_vehicle'
            recent={false}>
          </VehicleSpaceLayer>

          <VehicleSpaceLayer
            ids={this.state.duplicateSpaces}
            style={lotLayerStyles.duplicate_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.duplicateSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            type='duplicates'
            recent={false}>
          </VehicleSpaceLayer>

          <EventsLayer
            eventShapes={this.state.driveEventSpaces}
            type='test_drive'>
          </EventsLayer>
          <EventsLayer
            eventShapes={this.state.fuelEventSpaces}
            type='fuel'>
          </EventsLayer>

          <VehicleHighlightLayer
            clickedStallPolygon={this.state.clickedStall}>
          </VehicleHighlightLayer>
        </Mapbox.MapView>

        {this.maybeRenderSearchButton()}
        {this.maybeRenderTextInput()}

        {this.maybeRenderPopulateOnClick()}
        {this.maybeRenderActionFeedbackView()}

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
    fillOpacity: 0.4,
  },
  new_vehicle_recent_occupied_spaces: {
    fillColor: '#006699',
    fillOpacity: 1,
  },
  duplicate_spaces: {
    fillColor: '#FF0000',
    fillOpacity: 1,
  },
  parking_lot: {
    fillColor: '#CCCCCC',
    fillOpacity: 1,
  },
  parking_spaces: {
    fillColor: '#FFFFFF',
    fillOpacity: 0.75
  },
  used_vehicle_occupied_spaces: {
    fillColor: '#66CC00',
    fillOpacity: 0.4,
  },
  used_vehicle_recent_occupied_spaces: {
    fillColor: '#66CC00',
    fillOpacity: 1,
  },
  loaner_occupied_spaces: {
    fillColor: '#E8F051',
    fillOpacity: 0.4,
  },
  loaner_recent_occupied_spaces: {
    fillColor: '#E8F051',
    fillOpacity: 1,
  },
  lease_occupied_spaces: {
    fillColor: '#D13CEA',
    fillOpacity: 0.4,
  },
  lease_recent_occupied_spaces: {
    fillColor: '#D13CEA',
    fillOpacity: 1,
  },
  wholesale_occupied_spaces: {
    fillColor: '#8D8C88',
    fillOpacity: 0.4,
  },
  wholesale_recent_occupied_spaces: {
    fillColor: '#8D8C88',
    fillOpacity: 1,
  },
});

const debug_location = [37.353285, -122.0079];

const debug_highlight_polygon = {
  "geometry": {
    "coordinates":  [
       [
         [
          -122.00724072754383,
          37.35288456190844,
        ],
         [
          -122.00723871588707,
          37.352924805756714,
        ],
         [
          -122.00721139088273,
          37.352924805756714,
        ],
         [
          -122.0072128996253,
          37.35288456190844,
        ],
         [
          -122.00724072754383,
          37.35288456190844,
        ],
      ],
    ],
    "type": "Polygon",
  },
  "id": "130",
  "properties": {},
  "type": "Feature",
}