import React from 'react';
import {
  AsyncStorage,
  Image,
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  TextInput,
  View,
  Dimensions,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import BarcodeMask from 'react-native-barcode-mask';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';
import VehicleSpaceLayer from '../components/VehicleSpaceLayer';
import VehicleHighlightLayer from '../components/VehicleHighlightLayer';
import TempVehicleSpaceLayer from '../components/TempVehicleSpaceLayer';
import BuildingLayer from '../components/BuildingLayer';
import LandscapingLayer from '../components/LandscapingLayer';
import EventsLayer from '../components/EventsLayer';
import HoldsLayer from '../components/HoldsLayer';
import NoteLayer from '../components/NoteLayer';
import DuplicatesLayer from '../components/DuplicatesLayer';
import TagModalView from '../components/TagModalView';
import ClickToPopulateViewHandler from '../components/ClickToPopulateViewHandler';
import ActionFeedbackView from '../components/ActionFeedbackView';
import LotActionHelper from '../helpers/LotActionHelper';
import { hasLocationPermission } from '../helpers/PermissionHelper';
import buttonStyles from '../constants/ButtonStyles';
import Mapbox from '@react-native-mapbox-gl/maps';
import ActiveDrive from '../components/ActiveDrive';

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
    return <LotView navigation={this.props.navigation} />;
  }
}

const lotCenterCoordinates = [-122.00704220157868, 37.352814585339715];

class LotView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      centerCoordinate: lotCenterCoordinates,
      userLocation: null,
      zoomLevel: 17,
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
      soldSpaces: [],
      serviceHoldSpaces: [],
      salesHoldSpaces: [],
      driveEventSpaces: [],
      fuelEventSpaces: [],
      noteEventSpaces: [],
      parkingShapes: {},
      spaceVehicleMap: {},
      spaceId: null,
      vehicles: [],
      vehicleId: 0,
      modalType: GlobalVariables.BASIC_MODAL_TYPE,
      sku: null,
      vin: null,
      skuCollectorVisible: false,
      skuSearchFailed: false,
      stockNumberVehicleMap: {},
      extraVehicleData: {},
      clickToPopulateStall: null,
      clickedStall: null,
      feedbackText: 'Populating space...',
      findingOnMap: false,
      modalReopen: false,
      modalReopenTarget: 0,
      modalReopenHighlight: null,
      leaseRt: false,
      postLoadAction: '',
      barcodeOpen: false,
      cameraReady: false,
      barcodeTitle: 'Scan Barcode',
      skuInputEntered: '',
      leaseRtInput1: '',
      leaseRtInput2: '',
      leaseRtInput3: '',
      leaseRtInput4: '',
      leaseRtInput5: '',
      eventEnding: null,
      locatedVehicleID: null,
    };

    // required for android
    hasLocationPermission();

    let loadPromise = this._loadLotView(); // TODO(adwoa): add error handling when fetching data, ....catch(error => { lotview.setState({errorLoading: true, ...})})
    loadPromise.then(result => {
      console.log('PROMISE RESOLVED: ', result);
      if (result && result.name == 'Error') {
        console.log('Routing back to login page!', this.props);
        this.props.navigation.navigate('Auth');
      }
    });

    this.setSKUCollectorVisibility = this.setSKUCollectorVisibility.bind(this);
    this.setVehicleHighlight = this.setVehicleHighlight.bind(this);
    this.dismissInput = this.dismissInput.bind(this);
    this.skuEntered = 0;
    this.vinEntered = 0;
    this._loadLotView = this._loadLotView.bind(this);
    this.updateSpaceVehicleMap = false;
  }
  /**
   * Loads all of the data associated with a lot and updates
   * the associated state variables, triggering a reload of
   * the lotview.
   */
  componentWillMount() {
    this.props.navigation.setParams({
      section: 'lot',
      onPress: () => this.refresh(),
    });
  }
  componentWillReceiveProps(nextProps) {
    console.log('Component will receive props');
    if (nextProps.navigation.state.params.findingOnMap === true) {
      // if the navigation 'findingOnMap' param is true (from History screen)
      const { space_coords, findingOnMap } = nextProps.navigation.state.params;
      console.log('Finding on map Event. COORDS: ', space_coords);
      let centerCoordinate = this._calculateCenter(
        space_coords.geometry.coordinates[0],
      );
      console.log('set modal state true');
      this.setState({
        findingOnMap: findingOnMap,
        modalVisible: true,
        centerCoordinate: centerCoordinate,
        zoomLevel: 18.5,
        clickedStall: space_coords,
      });
    } else if (nextProps.navigation.state.params) {
      if (nextProps.navigation.state.params.extras) {
        // If the navigation contains an "extras" param (End fuelling or test drive)
        const { extras } = nextProps.navigation.state.params;
        console.log('extras', extras);
        // cancel fuelling event
        /*if (extras.fuelEventId) {
          console.log('Fuelling Event', extras);
          const { fuelEventId, spaceId } = extras;
          this.cancelFuel(fuelEventId, spaceId);
          this.setVehicleHighlight(null);
          this.updateSpaceVehicleMap = true;
          return this._loadLotView();
          // cancel fuelling event
        } else if (extras.driveEventId) {
          console.log('Driving Event started, REFRESHING ', extras);
          const { driveEventId, spaceId } = extras;
          this.setVehicleHighlight(null);
          this.updateSpaceVehicleMap = true;
          return this._loadLotView();
          //this.cancelDrive(driveEventId, spaceId);
          // update location
        } else */
        if (extras.endPackage) {
          //EVENT NEEDS TO BE ENDED
          const { endPackage, eventId, vehicleId } = extras;
          console.log('EVENT NEEDS TO BE ENDED');
          this.setVehicleHighlight(null);
          this.setState({
            postLoadAction: 'chooseEmptySpace',
            modalVisible: false,
            eventEnding: {
              endPackage: endPackage,
              eventId: eventId,
            },
            vehicleId: vehicleId,
          });
        } else if (extras.updateLocation && extras.updateLocation === true) {
          this.setVehicleHighlight(null);
          this.setState({
            postLoadAction: 'chooseEmptySpace',
            modalVisible: false,
          });
        } else if (extras.showModalonExit && extras.showModalonExit === true) {
          console.log('set modal state true');
          this.setState({
            findingOnMap: false,
            modalType: GlobalVariables.BASIC_MODAL_TYPE,
            modalVisible: true,
          });
        } else {
          this.setVehicleHighlight(null);
          this.setState({
            findingOnMap: false,
            modalType: GlobalVariables.BASIC_MODAL_TYPE,
            modalVisible: false,
          });
          return this._loadLotView();
        }
      } else {
        console.log('set modal state true');
        this.setState({ findingOnMap: false, modalVisible: true });
      }
    } else {
      console.log('set modal state true');
      this.setState({ findingOnMap: false, modalVisible: true });
    }
    if (
      nextProps.navigation.state.params &&
      nextProps.navigation.state.params.refresh
    ) {
      console.log('REFRESHING LOT');
      return this._loadLotView();
    }
  }
  refresh() {
    console.log('Refreshing');
    return this._loadLotView();
  }
  cancelFuel(fuelEventId, spaceId) {
    let endedPackage = {
      acknowledged: true,
      event_details: 'fuel event ' + fuelEventId + ' canceled',
    };

    let eventIdPromise = LotActionHelper.getEventId(spaceId, 'fuel_vehicle');
    eventIdPromise
      .then(event_id => {
        console.log('FUEL EVENT CANCELLED - EVENT ID: ', event_id);
        event_id.forEach(id => {
          LotActionHelper.endTimeboundTagAction(endedPackage, id);
        });
      })
      .then(this.setState({ findingOnMap: false, modalVisible: true }))
      .catch(e => console.log('FUEL EVENT ERROR: ', e));
  }
  cancelDrive(driveEventId, spaceId) {
    let endedPackage = {
      acknowledged: true,
      event_details: 'drive event ' + driveEventId + ' canceled',
    };

    let eventIdPromise = LotActionHelper.getEventId(spaceId, 'test_drive');
    eventIdPromise
      .then(event_id => {
        console.log('DRIVE EVENT CANCELLED - EVENT ID: ', event_id);
        event_id.forEach(id => {
          LotActionHelper.endTimeboundTagAction(endedPackage, id);
        });
      })
      .then(this.setState({ findingOnMap: false, modalVisible: true }))
      .catch(e => console.log('DRIVE EVENT ERROR: ', e));
  }
  _loadLotView() {
    var lotview = this;
    console.log('* * * * * LOAD LOT VIEW * * * * *');
    this.setModalVisibility(
      false,
      GlobalVariables.ACTION_FEEDBACK_MODAL_TYPE,
      null,
      'Updating Lot...',
    );
    return fetch(GlobalVariables.BASE_ROUTE + Route.FULL_LOT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Bearer ' + GlobalVariables.LOTWING_ACCESS_TOKEN,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        //console.log('\nLOADLOTVIEW RESPONSE: ', responseJson, '\n');
        if (responseJson.message == 'Signature has expired') {
          console.log('Throwing Error');
          throw Error('Unauthorized user');
        }
        GlobalVariables.LOT_DATA = responseJson;
        let lot_geometry =
          GlobalVariables.LOT_DATA.parking_lots[0].geo_info.geometry;
        let lot_coords = lot_geometry.coordinates[0];

        let lotParkingSpaceMap = {};
        GlobalVariables.LOT_DATA.parking_spaces.forEach(space => {
          lotParkingSpaceMap[space.id] = space;
        });
        //console.log('LoadLotView response: /n/n/n', lot_geometry);
        //console.log('LoadLotView response: /n/n/n', lotParkingSpaceMap);
        console.log('     resetting state: _loadLotView');

        lotview._loadParkingSpaceMetadata({
          centerCoordinate:
            this.state.centerCoordinate === null
              ? lotview._calculateCenter(lot_coords)
              : this.state.centerCoordinate,
          parkingShapes: lotParkingSpaceMap,
        });
      })
      .catch(err => {
        console.log('CAUGHT ERR, attempting logout: ', err, err.name);
        return err;
      });
  }
  _loadParkingSpaceMetadata({ centerCoordinate, parkingShapes }) {
    var lotview = this;

    return fetch(GlobalVariables.BASE_ROUTE + Route.PARKING_SPACE_METADATA, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Bearer ' + GlobalVariables.LOTWING_ACCESS_TOKEN,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log('load parking space metadata setState');
        this.updateSpaceVehicleMap = true;
        lotview.setState({
          newVehicleSpaces: responseJson.new_vehicle_occupied_spaces.map(
            space => space.id,
          ),
          usedVehicleSpaces: responseJson.used_vehicle_occupied_spaces.map(
            space => space.id,
          ),
          emptySpaces: responseJson.empty_parking_spaces.map(space => space.id),
          duplicateSpaces: responseJson.duplicate_parked_spaces.map(
            space => space.id,
          ),
          loanerSpaces: responseJson.loaner_occupied_spaces.map(
            space => space.id,
          ),
          leaseSpaces: responseJson.lease_return_occupied_spaces.map(
            space => space.id,
          ),
          wholesaleSpaces: responseJson.wholesale_unit_occupied_spaces.map(
            space => space.id,
          ),
          soldSpaces: responseJson.sold_vehicle_spaces.map(space => space.id),
          serviceHoldSpaces: responseJson.service_hold_spaces.map(
            space => space.id,
          ),
          salesHoldSpaces: responseJson.sales_hold_spaces.map(
            space => space.id,
          ),
          centerCoordinate:
            centerCoordinate !== null ? centerCoordinate : lotCenterCoordinates,
          lotShapes: GlobalVariables.LOT_DATA,
          parkingShapes,
          errorLoading: false,
          modalVisible: false,
          spaceVehicleMap: {},
          modalType: GlobalVariables.BASIC_MODAL_TYPE,
          sku: null,
          vin: null,
          skuCollectorVisible: false,
          skuSearchFailed: false,
          stockNumberVehicleMap: {},
          extraVehicleData: {},
          clickToPopulateStall: null,
          feedbackText: '',
          leaseRt: false,
          skuInputEntered: '',
          leaseRtInput1: '',
          leaseRtInput2: '',
          leaseRtInput3: '',
          leaseRtInput4: '',
          leaseRtInput5: '',
        });
        this.updateSpaceVehicleMap = false;
        lotview._loadEvents();
        if (this.state.postLoadAction === 'chooseEmptySpace') {
          this.setVehicleHighlight(null);
          this.setModalVisibility(false, GlobalVariables.CHOOSE_EMPTY_SPACE);
          this.setState({ postLoadAction: '' });
        }
        if (this.state.modalReopen) {
          this.showAndPopulateModal(
            [this.state.modalReopenTarget, null],
            this.state.modalReopenHighlight,
          );
          this.setState({ modalReopen: false });
        }
      });
  }
  _loadEvents() {
    console.log('Loading Events');
    var lotview = this;
    return fetch(GlobalVariables.BASE_ROUTE + Route.EVENTS, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Bearer ' + GlobalVariables.LOTWING_ACCESS_TOKEN,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        lotview.setState({
          driveEventSpaces: responseJson.test_drive_events.map(
            space => space.data.attributes,
          ),
          fuelEventSpaces: responseJson.fuel_vehicle_events.map(
            space => space.data.attributes,
          ),
          noteEventSpaces: responseJson.note_events.map(
            space => space.data.attributes,
          ),
        });
      });
  }
  _calculateCenter(coord, CENTER_TYPE = 'MAX_MIN') {
    let center_coordinate = [];

    if (CENTER_TYPE == 'SIMPLE_AVE') {
      // simple average x and average y of all of the lots coordinates
      let ave_latitude = 0;
      let ave_longitude = 0;
      let num_coordinates = coord.length;

      let center = coord.forEach(point => {
        ave_latitude += point[0];
        ave_longitude += point[1];
      });

      center_coordinate = [
        ave_latitude / num_coordinates,
        ave_longitude / num_coordinates,
      ];
    } else if (CENTER_TYPE == 'MAX_MIN') {
      // average of the max and min x and y points in the lot
      let max_min_array = [
        [coord[0][0], coord[0][0]],
        [coord[0][1], coord[0][1]],
      ]; // [[x_min, x_max], [y_min, y_max]]

      coord.forEach(point => {
        const [px, py] = point;

        if (max_min_array[0][0] > px) {
          max_min_array[0][0] = px;
        }
        if (max_min_array[0][1] < px) {
          max_min_array[0][1] = px;
        }

        if (max_min_array[1][0] > py) {
          max_min_array[1][0] = py;
        }
        if (max_min_array[1][1] < py) {
          max_min_array[1][1] = py;
        }
      });

      center_coordinate = [
        max_min_array[0].reduce((a, b) => {
          return a + b;
        }) / 2,
        max_min_array[1].reduce((a, b) => {
          return a + b;
        }) / 2,
      ];
    }

    return center_coordinate;
  }

  unauthorizedError() {
    let err = new Error();
    err.name = 'UnAuthError';

    console.log('ERR: ', err);
    return err;
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
  };
  setModalId = (id, vehicleArray) => {
    console.log('Lot View Vehicle ID: ', id);
    this.state.vehicleId !== id &&
      this.setState({ vehicleId: id, vehicles: vehicleArray });
  };

  // Modal Visibility controls
  setModalVisibility(
    visibility,
    modalType = null,
    vehicleId = null,
    opt_basic_modal_action_fb_msg = null,
  ) {
    // let clickedStallValue = visibility ? this.state.clickedStall : null;
    // console.log('\n* * * *   show clicked stall? ', clickedStallValue, '\n\n\n');
    console.log('Set modal visibility');
    if (modalType !== null) {
      let textToShow = null;
      if (modalType === GlobalVariables.CHOOSE_EMPTY_SPACE) {
        Keyboard.dismiss();
        this.setState({ skuCollectorVisible: false });
        textToShow = 'Choose the stall to populate...';
        console.log('Should populate VEHICLE ', vehicleId);
      } else if (
        modalType === GlobalVariables.ACTION_FEEDBACK_MODAL_TYPE &&
        visibility === false &&
        opt_basic_modal_action_fb_msg
      ) {
        textToShow = opt_basic_modal_action_fb_msg;
      }
      console.log('set modal state visibility:', visibility);
      this.setState({
        modalVisible: visibility,
        modalType: modalType,
        feedbackText: textToShow,
      });
    } else {
      console.log('set modal state visibility:', visibility);
      this.setState({
        modalVisible: visibility,
        modalType: GlobalVariables.BASIC_MODAL_TYPE,
      });
    }
  }

  setPopulateViewVisibility(visibility, modalType = null, vehicleId = null) {
    console.log('set modal state visibility:', visibility);
    this.setState({
      modalVisible: visibility,
      modalType: modalType,
      // feedbackText: textToShow,
    });
  }

  updateLotAndDismissModal = (
    new_stall,
    vehicleId = null,
    sku_number = null,
    vin = null,
    opt_feedbackMsg = null,
  ) => {
    // 1. Remove Vehicle  Highlight
    console.log('updateLotAndDismissModal');
    const tempHighlight = this.state.clickedStall;
    this.setVehicleHighlight(null);

    // 2. Dismiss Modal & Show Loading Feedback
    this.setModalVisibility(
      false,
      GlobalVariables.ACTION_FEEDBACK_MODAL_TYPE,
      null,
      opt_feedbackMsg,
    );

    // 3. Update Stall Number & Fetch Updated Lot
    if (vehicleId) {
      console.log('VEHICLE ID ENTERED: updating');
      let stallUpdatedPromise = this.updateStallNumber(new_stall, vehicleId);

      stallUpdatedPromise.then(result => {
        console.log('STALL UPDATE RESULT from vehicle ID: ', result);
        // 3. Re-render lot by updating state
        return this._loadLotView();
      });
    } else if (sku_number) {
      console.log('SKU ENTERED: updating');
      this.skuEntered = sku_number;
      this.vinEntered = null;
      this.setState({ sku: this.skuEntered, vin: this.vinEntered });
      let vehiclePromise = this._getVehicleByType('sku');

      vehiclePromise
        .then(vehicleData => {
          console.log(
            'Vehicle data from updateLotAndDismissModal: ',
            vehicleData,
          );
          if (vehicleData.vehicle === null) {
            this.setModalVisibility(
              true,
              GlobalVariables.CREATE_MODAL_TYPE,
              null,
              null,
            );
            this.setVehicleHighlight(tempHighlight);
          } else if (this.checkActiveEvents(vehicleData.events)) {
            this.setState({ vehicleId: vehicleData.vehicle.id });
            this.jumpToEventScreen(vehicleData);
          } else {
            return this.updateStallNumber(new_stall, vehicleData.vehicle.id);
          }
        })
        .then(result => {
          console.log('STALL UPDATE RESULT from SKU: ', result);
          // 3. Re-render lot by updating state
          if (result !== undefined) {
            console.log('result is not undefined');
            return this._loadLotView();
          } else {
            console.log('result is undefined', this.state.modalType);
          }
        });
    } else if (vin) {
      console.log('VIN ENTERED: updating');
      this.vinEntered = vin;
      this.skuEntered = null;
      this.setState({ sku: this.skuEntered, vin: this.vinEntered });
      if (this.vinEntered === '---') {
        this.setState({
          feedbackText: 'Barcode cannot be read.',
        });
      } else if (this.vinEntered.length !== 17) {
        this.setState({
          feedbackText:
            'VIN must be 17 character long. \nEntered Vin: ' + this.vinEntered,
        });
      } else {
        let vehiclePromise = this._getVehicleByType('vin');

        vehiclePromise
          .then(vehicleData => {
            console.log(
              'Vehicle data from updateLotAndDismissModal: ',
              vehicleData,
            );
            if (vehicleData.vehicle === null) {
              this.setModalVisibility(
                true,
                GlobalVariables.CREATE_MODAL_TYPE,
                null,
                null,
              );
              this.setVehicleHighlight(tempHighlight);
            } else if (this.checkActiveEvents(vehicleData.events)) {
              this.jumpToEventScreen(vehicleData);
            } else {
              return this.updateStallNumber(new_stall, vehicleData.vehicle.id);
            }
          })
          .then(result => {
            console.log('STALL UPDATE RESULT from VIN: ', result);
            // 3. Re-render lot by updating state
            if (result !== undefined) {
              console.log('result is not undefined');
              return this._loadLotView();
            } else {
              console.log('result is undefined', this.state.modalType);
            }
          });
      }
    } else {
      console.log('no vehicleID or sku_number');
      return this._loadLotView();
    }
  };

  updateLotAndReopenModal = space_id => {
    console.log('Update lot and reopen modal');
    const tempHighlight = this.state.clickedStall;
    this.setState({
      modalReopen: true,
      modalReopenTarget: space_id,
      modalReopenHighlight: tempHighlight,
    });
    this.refresh();
    //this.updateLotAndDismissModal(null, null, null, null, 'Updating Lot...');
  };
  updateStallNumber(new_stall, vehicleId) {
    let newSpaceData = { spaceId: new_stall, vehicleId: vehicleId };
    let space_data = LotActionHelper.structureTagPayload(
      'change_stall',
      newSpaceData,
      'Moved vehicle to stall ' + new_stall,
    );
    this.setState({ vehicleId: vehicleId });
    console.log('vehicle id: ', vehicleId, ' == ', this.state.vehicleId);
    console.log('old space id: ', this.state.spaceId);
    console.log('new space id: ', new_stall);
    console.log('sku number: ', this.state.stockNumber);
    console.log('Body: ', JSON.stringify(space_data));
    return fetch(GlobalVariables.BASE_ROUTE + Route.TAG_VEHICLE, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + GlobalVariables.LOTWING_ACCESS_TOKEN,
      },
      body: JSON.stringify(space_data),
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        return responseJson;
        console.log('Response from updateStallNumber', responseJson);
      })
      .catch(err => {
        console.log('\nCAUGHT ERROR: \n', err, err.name);
        this.setState({ feedbackText: 'Error in tagging vehicle' });
        //TODO(adwoa): make save button clickable again
        return err;
      });
  }
  setModalValues(modal_type, space_id, vehiclesArray) {
    console.log('Set Modal Values');
    // IF stall is empty only space_id needed
    if (modal_type === GlobalVariables.EMPTY_MODAL_TYPE) {
      if (!space_id) {
        throw Error('No space id was passed to display the empty tag modal');
      }
    }
    // IF stall is populated pass all data barring extra which is optional
    if (space_id === null) {
      // special case where we don't have a space id
      this.setState({ vehicles: vehiclesArray });
    }
    this.setState({
      modalType: modal_type,
      spaceId: space_id,
    });
  }

  setVehicleHighlight(polygonClicked) {
    let centerCoordinate = this.state.centerCoordinate;
    if (polygonClicked !== null) {
      centerCoordinate = this._calculateCenter(
        polygonClicked.geometry.coordinates[0],
      );
    }
    console.log('SET VEHICLE HIGHLIGHT: ', centerCoordinate);
    this.setState({
      clickedStall: polygonClicked,
      centerCoordinate: centerCoordinate,
    });
  }

  findOnMap = boolean => {
    console.log('Find on Map');
    this.setState({ findingOnMap: boolean });
  };

  showAndPopulateModal = (data, polygonClicked) => {
    let [space_id, vehicleData] = data;
    console.log('Show and Populate Space ID: ', space_id);
    console.log('VehicleID: ', this.state.vehicleId);
    //console.log('Modal Type: ', this.state.modalType);
    // Highlight selected stall
    // 1. Pass polygon clicked or searched for here in order to highlight
    if (polygonClicked) {
      this.setVehicleHighlight(polygonClicked);
    } else {
      this.setVehicleHighlight(null);
    }
    // Display Proper Modal and Highlight selected stall
    if (this.state.modalType != GlobalVariables.CHOOSE_EMPTY_SPACE) {
      this.setState({ leaseRt: false });
      if (vehicleData && vehicleData == GlobalVariables.EMPTY_MODAL_TYPE) {
        console.log('\n\nEmpty Modal');
        // show empty modal
        this.setModalValues(GlobalVariables.EMPTY_MODAL_TYPE, space_id);
        this.setModalVisibility(true, GlobalVariables.EMPTY_MODAL_TYPE);
      } else if (vehicleData === null) {
        console.log('Extra data not empty: ', space_id);
        let vehiclesArray = [];
        this.setModalValues(
          GlobalVariables.BASIC_MODAL_TYPE,
          space_id,
          vehiclesArray,
        );
        this.setModalVisibility(true);
      } else if (space_id !== null && vehicleData !== null) {
        console.log('SPACE ID isnt null and VEHICLEDATA isnt null');
        this.setModalValues(
          GlobalVariables.BASIC_MODAL_TYPE,
          space_id,
          vehicleData,
        );
        this.setModalVisibility(true);
      } else {
        console.log('DATA MISSING: ', vehicleData);
      }
    } else {
      // Show Add Vehicle to highlighted space message
      this.populateStall(space_id);
    }
  };

  populateStall(space_id) {
    if (space_id) {
      this.setState({
        clickToPopulateStall: space_id,
        feedbackText:
          'Populating stall ' +
          space_id +
          ' with vehicle ID ' +
          this.state.vehicleId +
          '...',
      });

      console.log(
        ' - - - - - IN UPDATE LOT AND DISMISS ON CLICK POPULATE VIEW',
      );
      console.log('VEHICLE ID: ', this.state.vehicleId);
      // 2. Update Stall Number & Fetch updated lot
      if (this.state.vehicleId) {
        console.log('VEHICLE ID ENTERED: updating');
        // EVENT ENDING
        console.log('Event Ending: ', this.state.eventEnding);
        if (this.state.eventEnding !== null) {
          const { endPackage, eventId } = this.state.eventEnding;
          let eventIdPromise = LotActionHelper.endTimeboundTagAction(
            endPackage,
            eventId,
          ).then(result => {
            this.setState({ eventEnding: null });
            let stallUpdatedPromise = this.updateStallNumber(
              space_id,
              this.state.vehicleId,
            );

            stallUpdatedPromise.then(result => {
              console.log('Returned from stallUpdatedPromise');
              this.setState({ feedbackText: 'Stall updated!' });
              // 3. Re-render lot by updating state
              this.updateLotAndReopenModal(space_id);
              //this.updateSpaceVehicleMap = true;
              //return this._loadLotView();
            });
          });
        } else {
          let stallUpdatedPromise = this.updateStallNumber(
            space_id,
            this.state.vehicleId,
          );

          stallUpdatedPromise.then(result => {
            console.log('Returned from stallUpdatedPromise');
            this.setState({ feedbackText: 'Stall updated!' });
            // 3. Re-render lot by updating state
            this.updateLotAndReopenModal(space_id);
            //this.updateSpaceVehicleMap = true;
            //return this._loadLotView();
          });
        }
      } else {
        this.setState({ feedbackText: 'Vehicle ID missing' });
      }
    }
  }

  dismissInput = () => {
    Keyboard.dismiss();
    this.setState({ skuCollectorVisible: false });
  };

  // Map Data
  getMapCallback = (type, data) => {
    console.log('In Get Map Callback...  ', type);
    let snVehicleMap = this.state.stockNumberVehicleMap;

    if (type == 'new_vehicle' || type == 'used_vehicle') {
      Object.keys(data).forEach(spaceId => {
        // console.log('SPACE QUERIED: ', spaceId);
        let vehicleData = data[spaceId];

        if (vehicleData) {
          vehicleData.shape_id = spaceId;
          snVehicleMap[vehicleData.stock_number] = vehicleData;
        }
      });
      // console.log('NEW STOCK VEHICLE MAP: ', Object.keys(snVehicleMap), '\n\n');
    }

    this.setState({
      stockNumberVehicleMap: snVehicleMap,
    });
  };
  // SKU Collector Visibility controls
  setSKUCollectorVisibility() {
    let visibile = !this.state.skuCollectorVisible;
    this.setState({
      skuCollectorVisible: visibile,
      skuSearchFailed: false,
    });
  }

  getSKUFromInput() {
    return this.skuEntered;
  }

  locateVehicle(type) {
    console.log('Locating vehicle..');
    this.setModalVisibility(
      false,
      GlobalVariables.ACTION_FEEDBACK_MODAL_TYPE,
      null,
      'Locating vehicle',
    );
    if (type === 'sku') {
      console.log('\n\nChecking Server for SKU: ', this.state.skuInputEntered);
      this.skuEntered = this.state.skuInputEntered;
      if (this.state.leaseRt) {
        this.skuEntered =
          this.state.leaseRtInput1 +
          this.state.leaseRtInput2 +
          this.state.leaseRtInput3 +
          this.state.leaseRtInput4 +
          this.state.leaseRtInput5;
      }
      this.setState({
        sku: this.skuEntered,
        vin: null,
        skuCollectorVisible: false,
      });
    } else if (type === 'vin') {
      console.log('\n\nChecking Server for VIN: ', this.vinEntered);
      this.setState({ vin: this.vinEntered, skuCollectorVisible: false });
    }
    //let sku = this.getSKUFromInput();
    this.setVehicleHighlight(null);

    if (type === 'vin' && this.vinEntered.length !== 17) {
      this.setModalVisibility(
        false,
        GlobalVariables.ACTION_FEEDBACK_MODAL_TYPE,
        null,
        'VIN must be 17 character long. \nEntered Vin: ' + this.vinEntered,
      );
    } else {
      let vehiclePromise = this._getVehicleByType(type);
      //let vehiclePromise = this._getVehicleByVIN(this.vinEntered);

      vehiclePromise.then(response => {
        const { space_id, polygon, vehicle, events } = response;
        vehicle !== null &&
          typeof vehicle.id !== 'undefined' &&
          this.setState({ locatedVehicleID: vehicle.id });
        console.log(
          'check Active events results: ',
          this.checkActiveEvents(events),
        );
        if (this.checkActiveEvents(events)) {
          this.setState({ vehicleId: vehicle.id });
          this.jumpToEventScreen(response);
        } else if (space_id) {
          console.log(
            'SPACE_ID',
            this._calculateCenter(polygon.geometry.coordinates[0]),
          );
          //this._calculateCenter(polygon.geometry.coordinates[0]);
          this.dismissInput();
          this.showAndPopulateModal([space_id, null], polygon);
          this.setState({
            spaceId: space_id,
            centerCoordinate: this._calculateCenter(
              polygon.geometry.coordinates[0],
            ),
          });
        } else if (space_id === null && vehicle) {
          console.log('Pulling car from server: ', vehicle.id);
          this.setState({ vehicleId: vehicle.id, spaceId: null });
          this.setModalVisibility(
            false,
            GlobalVariables.CHOOSE_EMPTY_SPACE,
            vehicle.id,
          );
        } else {
          // Display sku location failure text within search modal
          this.dismissInput();
          this.setState({ vehicleId: null, spaceId: null });
          this.setModalVisibility(
            true,
            GlobalVariables.CREATE_MODAL_TYPE,
            null,
            null,
          );
        }
      });
    }
  }
  checkActiveEvents(events) {
    let eventCounter = 0;
    events !== null &&
      events.forEach(event => {
        const {
          event_type,
          started_at,
          ended_at,
          id,
          summary,
        } = event.data.attributes;
        //console.log('Event Type: ', event_type, 'Started At: ', started_at, 'Ended at: ', ended_at)
        if (
          event_type === GlobalVariables.BEGIN_FUELING &&
          started_at !== null &&
          ended_at === null
        ) {
          eventCounter++;
        }
        if (
          event_type === GlobalVariables.BEGIN_DRIVE &&
          started_at !== null &&
          ended_at === null
        ) {
          eventCounter++;
        }
      });
    if (eventCounter > 0) {
      return true;
    } else {
      return false;
    }
  }
  jumpToEventScreen(vehicleResponse) {
    console.log('Vehicle Data contains events');
    const { space_id, polygon, vehicle, events } = vehicleResponse;
    let eventsList = [];
    events !== null &&
      events.forEach(event => {
        //console.log(event.data)
        const {
          event_type,
          started_at,
          ended_at,
          id,
          summary,
        } = event.data.attributes;
        if (
          event_type === GlobalVariables.BEGIN_FUELING &&
          started_at !== null &&
          ended_at === null
        ) {
          eventsList.push({
            space_id: space_id,
            vehicles: [vehicle],
            event_type: event_type,
            event_id: id,
            started_at: started_at,
            summary: summary,
          });
        }
        if (
          event_type === GlobalVariables.BEGIN_DRIVE &&
          started_at !== null &&
          ended_at === null
        ) {
          eventsList.push({
            space_id: space_id,
            vehicles: [vehicle],
            event_type: event_type,
            event_id: id,
            started_at: started_at,
            summary: summary,
          });
        }
      });
    let navTarget = null;
    let navIndex = 0;
    if (eventsList.length > 0) {
      console.log('Length', eventsList.length);
      eventsList.forEach((event, index) => {
        if (
          event.event_type === GlobalVariables.BEGIN_FUELING &&
          navTarget === null
        ) {
          navTarget = GlobalVariables.BEGIN_FUELING;
          navIndex = index;
        }
        if (
          event.event_type === GlobalVariables.BEGIN_DRIVE &&
          navTarget === null
        ) {
          navTarget = GlobalVariables.BEGIN_DRIVE;
          navIndex = index;
        }
      });
    }
    if (navTarget === GlobalVariables.BEGIN_DRIVE) {
      this.props.navigation.navigate('Drive', {
        space_id: eventsList[navIndex].space_id,
        vehicles: eventsList[navIndex].vehicles,
        position: 0,
        eventId: eventsList[navIndex].event_id,
        started_at: eventsList[navIndex].started_at,
        summary: eventsList[navIndex].summary,
      });
    }
    if (navTarget === GlobalVariables.BEGIN_FUELING) {
      this.props.navigation.navigate('Fuel', {
        space_id: eventsList[navIndex].space_id,
        vehicles: eventsList[navIndex].vehicles,
        position: 0,
        eventId: eventsList[navIndex].event_id,
        started_at: eventsList[navIndex].started_at,
        summary: eventsList[navIndex].summary,
      });
    }
  }

  _getVehicleByType(type) {
    //this.setState({ vin: vin })
    let url =
      GlobalVariables.BASE_ROUTE + Route.VEHICLE_BY_SKU + this.skuEntered;
    if (type === 'vin') {
      url = GlobalVariables.BASE_ROUTE + Route.VEHICLE_BY_VIN + this.vinEntered;
    }
    console.log('URL: ', url);
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Bearer ' + GlobalVariables.LOTWING_ACCESS_TOKEN,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        //console.log('VEHICLE PULLED FROM STORE: ', responseJson);
        const { current_parking_space, vehicle, events } = responseJson;
        return {
          space_id:
            current_parking_space !== null ? current_parking_space.id : null,
          polygon:
            current_parking_space !== null
              ? current_parking_space.geo_info
              : this.state.clickedStall,
          vehicle: vehicle,
          events: events,
        };
      })
      .catch(err => {
        return false;
      });
  }

  openBarcodeScanner = () => {
    console.log('open barcode scanner from modal');
    this.setState({
      barcodeOpen: true,
      cameraReady: true,
      barcodeTitle: 'Vehicle requires a scan to create',
    });
  };

  getLot() {
    if (this.state.lotShapes) {
      return this.state.lotShapes.parking_lots[0].geo_info;
    }
    return GlobalVariables.EMPTY_GEOJSON;
  }

  getBuildings() {
    let buildingMap = {};
    if (this.state.lotShapes) {
      this.state.lotShapes.buildings.forEach(shape => {
        buildingMap[shape.id] = shape;
      });
    }
    return buildingMap;
  }

  getLandscaping() {
    let landscapingMap = {};
    if (this.state.lotShapes && this.state.lotShapes.landscapings) {
      this.state.lotShapes.landscapings.forEach(shape => {
        landscapingMap[shape.id] = shape;
      });
    }
    return landscapingMap;
  }
  maybeRenderSearchButton() {
    if (this.state.modalType != GlobalVariables.CHOOSE_EMPTY_SPACE) {
      return (
        <View style={styles.floatingActionContainer}>
          <TouchableOpacity
            style={styles.floatingActionButton}
            onPress={this.setSKUCollectorVisibility}>
            <Image
              source={require('../../assets/images/search-solid.png')}
              style={styles.searchIconSizing}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.floatingActionButton}
            onPress={() =>
              this.setState({
                barcodeOpen: true,
                cameraReady: true,
                sku: null,
                barcodeTitle: 'Scan Barcode',
              })
            }>
            <Ionicons
              type="ionicon"
              name={'md-barcode'}
              size={25}
              style={{ color: '#FFF' }}
            />
          </TouchableOpacity>
        </View>
      );
    }
  }

  buildLeaseRt() {
    console.log('buildLeaseRT');
    const tempSku =
      this.state.leaseRtInput1 +
      this.state.leaseRtInput2 +
      this.state.leaseRtInput3 +
      this.state.leaseRtInput4 +
      this.state.leaseRtInput5;
    this.setState({
      skuInputEntered: tempSku,
      skuCollectorVisible: tempSku !== '',
    });
    tempSku !== '' && this.locateVehicle('sku');
  }

  maybeRenderTextInput() {
    if (this.state.skuCollectorVisible) {
      // console.log('SKU COLLECTOR should be visible? ', this.state.skuCollectorVisible);

      return (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          enabled
          keyboardVerticalOffset={
            getStatusBarHeight(true) + GlobalVariables.HEADER_HEIGHT
          }>
          <TouchableWithoutFeedback
            onPress={this.dismissInput}
            accessible={false}>
            <View style={{ minHeight: '40%', width: '100%' }} />
          </TouchableWithoutFeedback>

          <View>
            <View style={styles.floatingTextInputArea}>
              <Text
                style={[
                  textStyles.actionSummaryHeader,
                  { color: 'rgba(0, 0, 0, 0.75)' },
                ]}>
                {this.state.leaseRt ? 'CREATING LEASE RETURN' : 'STOCK NUMBER'}
              </Text>
              {this.state.leaseRt && (
                <Text
                  style={[
                    textStyles.actionSummaryHeader,
                    { color: 'rgba(0, 0, 0, 0.75)' },
                  ]}>
                  ENTER LAST 5 OF VIN
                </Text>
              )}
              {this.state.leaseRt ? (
                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                  <View
                    style={{
                      flex: 1,
                      marginRight: 10,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    }}>
                    <TextInput
                      ref="_lrI1"
                      autoCapitalize="characters"
                      multiline={false}
                      returnKeyType="search"
                      style={{ padding: 5, color: 'rgba(0, 0, 0, 0.75)' }}
                      onChangeText={text => {
                        this.setState({ leaseRtInput1: text });
                        text !== '' && this.refs._lrI2.focus();
                      }}
                      onSubmitEditing={event => this.buildLeaseRt()}
                      autoFocus={true}
                      maxLength={1}
                      selectTextOnFocus={true}
                      value={this.state.leaseRtInput1}
                    />
                  </View>
                  <View
                    style={{
                      flex: 1,
                      marginRight: 10,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    }}>
                    <TextInput
                      ref="_lrI2"
                      autoCapitalize="characters"
                      multiline={false}
                      returnKeyType="search"
                      style={{ padding: 5, color: 'rgba(0, 0, 0, 0.75)' }}
                      onChangeText={text => {
                        this.setState({ leaseRtInput2: text });
                        text !== '' && this.refs._lrI3.focus();
                      }}
                      onSubmitEditing={event => this.buildLeaseRt()}
                      maxLength={1}
                      selectTextOnFocus={true}
                      value={this.state.leaseRtInput2}
                      onKeyPress={({ nativeEvent }) => {
                        nativeEvent.key === 'Backspace' &&
                          this.state.leaseRtInput2 === '' &&
                          this.refs._lrI1.focus();
                      }}
                    />
                  </View>
                  <View
                    style={{
                      flex: 1,
                      marginRight: 10,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    }}>
                    <TextInput
                      ref="_lrI3"
                      autoCapitalize="characters"
                      multiline={false}
                      returnKeyType="search"
                      style={{ padding: 5, color: 'rgba(0, 0, 0, 0.75)' }}
                      onChangeText={text => {
                        this.setState({ leaseRtInput3: text });
                        text !== '' && this.refs._lrI4.focus();
                      }}
                      onSubmitEditing={event => this.buildLeaseRt()}
                      maxLength={1}
                      selectTextOnFocus={true}
                      value={this.state.leaseRtInput3}
                      onKeyPress={({ nativeEvent }) => {
                        nativeEvent.key === 'Backspace' &&
                          this.state.leaseRtInput3 === '' &&
                          this.refs._lrI2.focus();
                      }}
                    />
                  </View>
                  <View
                    style={{
                      flex: 1,
                      marginRight: 10,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    }}>
                    <TextInput
                      ref="_lrI4"
                      autoCapitalize="characters"
                      multiline={false}
                      returnKeyType="search"
                      style={{ padding: 5, color: 'rgba(0, 0, 0, 0.75)' }}
                      onChangeText={text => {
                        this.setState({ leaseRtInput4: text });
                        text !== '' && this.refs._lrI5.focus();
                      }}
                      onSubmitEditing={event => this.buildLeaseRt()}
                      maxLength={1}
                      selectTextOnFocus={true}
                      value={this.state.leaseRtInput4}
                      onKeyPress={({ nativeEvent }) => {
                        nativeEvent.key === 'Backspace' &&
                          this.state.leaseRtInput4 === '' &&
                          this.refs._lrI3.focus();
                      }}
                    />
                  </View>
                  <View
                    style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
                    <TextInput
                      ref="_lrI5"
                      autoCapitalize="characters"
                      multiline={false}
                      returnKeyType="search"
                      style={{ padding: 5, color: 'rgba(0, 0, 0, 0.75)' }}
                      onChangeText={text => {
                        this.setState({ leaseRtInput5: text });
                      }}
                      onSubmitEditing={event => this.buildLeaseRt()}
                      maxLength={1}
                      selectTextOnFocus={true}
                      value={this.state.leaseRtInput5}
                      onKeyPress={({ nativeEvent }) => {
                        nativeEvent.key === 'Backspace' &&
                          this.state.leaseRtInput5 === '' &&
                          this.refs._lrI4.focus();
                      }}
                    />
                  </View>
                </View>
              ) : (
                <TextInput
                  autoCapitalize="characters"
                  multiline={false}
                  returnKeyType="search"
                  style={[
                    styles.floatingTextInput,
                    { color: 'rgba(0, 0, 0, 0.75)' },
                  ]}
                  onChangeText={text =>
                    this.setState({ skuInputEntered: text })
                  }
                  onSubmitEditing={event => {
                    this.state.skuInputEntered !== '' &&
                      this.locateVehicle('sku');
                  }}
                  autoFocus={true}
                  value={this.state.skuInputEntered}
                />
              )}

              <Text
                style={[
                  textStyles.actionSummaryText,
                  {
                    color: '#BE1E2D',
                    fontSize: 10,
                    marginLeft: 10,
                    paddingBottom: 5,
                  },
                ]}>
                {this.state.skuSearchFailed
                  ? 'Vehicle not found. Please try another stock number.'
                  : ''}
              </Text>

              <View
                style={[
                  pageStyles.rightButtonContainer,
                  { width: 270, paddingTop: 5 },
                ]}>
                <TouchableOpacity
                  style={[
                    buttonStyles.activeSecondaryModalButton,
                    { marginRight: 'auto' },
                    !this.state.leaseRt && { backgroundColor: '#D13CEA' },
                  ]}
                  onPress={() =>
                    this.setState({ leaseRt: !this.state.leaseRt })
                  }>
                  <Text style={buttonStyles.activeSecondaryTextColor}>
                    {this.state.leaseRt ? 'BACK' : 'LEASE RT'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={buttonStyles.activeSecondaryModalButton}
                  onPress={this.dismissInput}>
                  <Text style={buttonStyles.activeSecondaryTextColor}>
                    CANCEL
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    buttonStyles.activePrimaryModalButton,
                    { borderColor: 'gray', borderWidth: 1 },
                  ]}
                  onPress={() => {
                    if (this.state.leaseRt) {
                      this.buildLeaseRt();
                    } else {
                      this.state.skuInputEntered !== '' &&
                        this.locateVehicle('sku');
                    }
                  }}>
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
            <View style={{ minHeight: '40%', width: '100%' }} />
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      );
    } else {
      return;
    }
  }

  _renderTagModal() {
    //console.log('Render Tag Modal View: ', this.state.modalType);
    let stockNumberToDisplay =
      this.state.modalType == GlobalVariables.BASIC_MODAL_TYPE
        ? this.state.stockNumber
        : null;
    return (
      <View
        //pose={this.state.modalVisible ? 'open' : 'closed'}
        style={{
          flex: 1,
          width: Dimensions.get('window').width,
          height:
            Dimensions.get('window').height -
            getStatusBarHeight(true) -
            GlobalVariables.HEADER_HEIGHT,
          position: 'absolute',
          bottom: 0,
          zIndex: 10,
          elevation: 10,
          backgroundColor: 'transparent',
        }}>
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
          updateLotAndReopenModal={this.updateLotAndReopenModal}
          setVehicleHighlight={this.setVehicleHighlight}
          findOnMap={this.findOnMap}
          findingOnMap={this.state.findingOnMap}
          openBarcodeScanner={this.openBarcodeScanner}
          sku={this.state.sku}
          vin={this.state.vin}
          leaseRt={this.state.leaseRt}
          locatedVehicleId={this.state.locatedVehicleID}
        />
      </View>
    );
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
          feedbackText={this.state.feedbackText}
        />
      );
    }
  }

  maybeRenderActionFeedbackView() {
    if (
      this.state.modalType == GlobalVariables.ACTION_FEEDBACK_MODAL_TYPE &&
      this.state.modalVisible == false
    ) {
      return <ActionFeedbackView feedbackText={this.state.feedbackText} />;
    }
  }

  maybeRenderMapControls() {
    //lotCenterCoordinates
    if (
      this.state.modalType != GlobalVariables.CHOOSE_EMPTY_SPACE &&
      !this.state.barcodeOpen
    ) {
      return (
        <View
          style={{
            position: 'absolute',
            zIndex: 2,
            elevation: 2,
            right: 10,
            top: 10,
          }}>
          <TouchableOpacity
            onPress={() =>
              this.setState({
                centerCoordinate: [
                  this.state.userLocation.coords.longitude,
                  this.state.userLocation.coords.latitude,
                ],
              })
            }
            style={styles.floatingActionButton}>
            <Ionicons
              type="ionicon"
              name={'md-locate'}
              size={35}
              style={{
                color: '#FFF',
                marginTop: Platform.OS === 'ios' ? 2 : 0,
                marginLeft: Platform.OS === 'ios' ? 2 : 0,
              }}
            />
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }

  async onRegionDidChange(r) {
    console.log('Region did change:', r);
    if (typeof r !== 'undefined' && typeof this._map !== 'undefined') {
      const zoom = await this._map.getZoom();
      const center = await this._map.getCenter();
      this.setState({ zoomLevel: zoom, centerCoordinate: center });
    }
  }
  onBarCodeRead(e) {
    console.log('camera reading barcode');
    this.setState({ cameraReady: false });
    if (typeof e !== 'undefined') {
      if (typeof e.data !== 'undefined') {
        if (e.data.length > 0) {
          console.log('Barcode: ', e.data);
          this.vinEntered = e.data;
          this.setState({ barcodeOpen: false });
          this.setModalVisibility(
            false,
            GlobalVariables.ACTION_FEEDBACK_MODAL_TYPE,
            null,
            'Barcode read - Searching for vehicle',
          );
          this.locateVehicle('vin');
        } else {
          console.log('Barcode error');
          this.setState({ barcodeOpen: false });
          this.setModalVisibility(
            false,
            GlobalVariables.ACTION_FEEDBACK_MODAL_TYPE,
            null,
            'Error reading barcode - Barcode length is zero.',
          );
        }
      } else {
        console.log('Barcode error');
        this.setState({ barcodeOpen: false });
        this.setModalVisibility(
          false,
          GlobalVariables.ACTION_FEEDBACK_MODAL_TYPE,
          null,
          'Error reading barcode - Type is not a string.',
        );
      }
    } else {
      console.log('Barcode error');
      this.setState({ barcodeOpen: false });
      this.setModalVisibility(
        false,
        GlobalVariables.ACTION_FEEDBACK_MODAL_TYPE,
        null,
        'Error reading barcode - Data undefined.',
      );
    }
  }
  render() {
    console.log('\n\n\n+ + + Render Lot Screen + + +');
    //console.log('this.state.modalVisible', this.state.modalVisible);
    //console.log('Current Vehicle ID: ', this.state.vehicleId);
    if (this.state.barcodeOpen) {
      console.log('Barcode Open, Selected stall: ', this.state.clickedStall);
      return (
        <View style={{ flex: 1 }}>
          <View
            style={{
              flex: 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 10,
              elevation: 20,
              backgroundColor: 'white',
            }}>
            <Text style={{ fontWeight: 'bold' }}>
              {this.state.barcodeTitle}
            </Text>
          </View>

          <View
            style={{
              position: 'absolute',
              zIndex: 10,
              elevation: 10,
              width: 66,
              height: 66,
              backgroundColor: '#828282',
              borderRadius: 100,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#828282',
              shadowOffset: { width: 1, height: 1 },
              shadowOpacity: 20,
              right: 10,
              top: 40,
            }}>
            <TouchableOpacity
              onPress={() =>
                this.setState({ barcodeOpen: false, cameraReady: false })
              }>
              <View
                style={{
                  width: 66,
                  height: 66,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Ionicons
                  type="ionicon"
                  name={'md-close'}
                  size={35}
                  style={{
                    color: '#FFF',
                    marginTop: Platform.OS === 'ios' ? 2 : 0,
                    marginLeft: Platform.OS === 'ios' ? 2 : 0,
                  }}
                />
              </View>
            </TouchableOpacity>
          </View>
          <RNCamera
            onStatusChange={cameraStatus =>
              console.log('Camera Status: ', cameraStatus)
            }
            onMountError={e => console.log('Camera mount error: ', e)}
            onBarCodeRead={e => this.state.cameraReady && this.onBarCodeRead(e)}
            type={RNCamera.Constants.Type.back}
            autoFocus={RNCamera.Constants.AutoFocus.on}
            defaultTouchToFocus
            mirrorImage={Platform.OS !== 'ios'}
            permissionDialogTitle={'Permission to use camera'}
            permissionDialogMessage={
              'We need your permission to use your camera phone'
            }
            captureAudio={false}
            style={{ flex: 1 }}>
            <BarcodeMask showAnimatedLine={false} />
          </RNCamera>
        </View>
      );
    }

    const lot = this.getLot();
    const populated = lot.id !== 'empty_geojson';

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={styles.container}
        enabled
        keyboardVerticalOffset={
          getStatusBarHeight(true) + GlobalVariables.HEADER_HEIGHT
        }>
        <ActiveDrive
          refresh={this.updateSpaceVehicleMap}
          navigation={this.props.navigation}
        />
        <StatusBar barStyle="light-content" backgroundColor="#BE1E2D" />

        {this.state.modalVisible && this._renderTagModal()}

        <Mapbox.MapView
          showUserLocation={true}
          style={styles.container}
          styleURL={Mapbox.StyleURL.Street}
          ref={c => (this._map = c)}
          onRegionDidChange={r => this.onRegionDidChange(r)}>
          <Mapbox.Camera
            zoomLevel={this.state.zoomLevel}
            centerCoordinate={this.state.centerCoordinate}
            animationMode="flyTo"
            animationDuration={0}
          />

          {populated ? (
            <Mapbox.ShapeSource id="parking_lot" shape={lot}>
              <Mapbox.FillLayer
                id="fill_parking_lot"
                style={lotLayerStyles.parking_lot}
              />
            </Mapbox.ShapeSource>
          ) : (
            <></>
          )}

          <LandscapingLayer landscapingShapes={this.getLandscaping()} />
          <BuildingLayer buildingShapes={this.getBuildings()} />

          <TempVehicleSpaceLayer
            ids={this.state.emptySpaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.emptySpaces}
            showAndPopulateModal={this.showAndPopulateModal}
            setModalVisibility={this.setModalVisibility}
            sendMapCallback={this.getMapCallback}
            updateSpaceVehicleMap={false}
            updateEvents={this.postLoadEvents}
            type="temp"
            recent={false}
          />

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
            type="empty"
            recent={false}
          />

          <VehicleSpaceLayer
            ids={this.state.newVehicleSpaces}
            style={lotLayerStyles.new_vehicle_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.newVehicleSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            type="new_vehicle"
            recent={false}
            blank={this.state.findingOnMap}
          />

          <VehicleSpaceLayer
            ids={this.state.newVehicleSpaces}
            style={lotLayerStyles.new_vehicle_recent_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.newVehicleSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            type="new_vehicle"
            recent={true}
            blank={this.state.findingOnMap}
          />

          <VehicleSpaceLayer
            ids={this.state.usedVehicleSpaces}
            style={lotLayerStyles.used_vehicle_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.usedVehicleSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            type="used_vehicle"
            recent={false}
            blank={this.state.findingOnMap}
          />

          <VehicleSpaceLayer
            ids={this.state.usedVehicleSpaces}
            style={lotLayerStyles.used_vehicle_recent_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.usedVehicleSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            updateEvents={this.postLoadEvents}
            type="used_vehicle"
            recent={true}
            blank={this.state.findingOnMap}
          />

          <VehicleSpaceLayer
            ids={this.state.loanerSpaces}
            style={lotLayerStyles.loaner_recent_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.loanerSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            updateEvents={this.postLoadEvents}
            type="loaner_vehicle"
            recent={true}
            blank={this.state.findingOnMap}
          />

          <VehicleSpaceLayer
            ids={this.state.loanerSpaces}
            style={lotLayerStyles.loaner_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.loanerSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            updateEvents={this.postLoadEvents}
            type="loaner_vehicle"
            recent={false}
            blank={this.state.findingOnMap}
          />

          <VehicleSpaceLayer
            ids={this.state.leaseSpaces}
            style={lotLayerStyles.lease_recent_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.leaseSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            updateEvents={this.postLoadEvents}
            type="lease_vehicle"
            recent={true}
            blank={this.state.findingOnMap}
          />

          <VehicleSpaceLayer
            ids={this.state.leaseSpaces}
            style={lotLayerStyles.lease_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.leaseSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            updateEvents={this.postLoadEvents}
            type="lease_vehicle"
            recent={false}
            blank={this.state.findingOnMap}
          />

          <VehicleSpaceLayer
            ids={this.state.wholesaleSpaces}
            style={lotLayerStyles.wholesale_recent_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.wholesaleSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            updateEvents={this.postLoadEvents}
            type="wholesale_vehicle"
            recent={true}
            blank={this.state.findingOnMap}
          />

          <VehicleSpaceLayer
            ids={this.state.wholesaleSpaces}
            style={lotLayerStyles.wholesale_occupied_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.wholesaleSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            updateEvents={this.postLoadEvents}
            type="wholesale_vehicle"
            recent={false}
            blank={this.state.findingOnMap}
          />

          <VehicleSpaceLayer
            ids={this.state.soldSpaces}
            style={lotLayerStyles.sold_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.soldSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            updateEvents={this.postLoadEvents}
            type="sold"
            recent={false}
            blank={this.state.findingOnMap}
          />

          <DuplicatesLayer
            ids={this.state.duplicateSpaces}
            style={lotLayerStyles.duplicate_spaces}
            parkingShapes={this.state.parkingShapes}
            spaces={this.state.duplicateSpaces}
            sendMapCallback={this.getMapCallback}
            showAndPopulateModal={this.showAndPopulateModal}
            updateSpaceVehicleMap={this.updateSpaceVehicleMap}
            type="duplicates"
            recent={false}
            blank={this.state.findingOnMap}
          />

          <EventsLayer
            eventShapes={this.state.driveEventSpaces}
            type="test_drive"
          />
          <EventsLayer eventShapes={this.state.fuelEventSpaces} type="fuel" />
          <EventsLayer eventShapes={this.state.noteEventSpaces} type="note" />

          <HoldsLayer
            spaces={this.state.serviceHoldSpaces}
            parkingShapes={this.state.parkingShapes}
            skip={this.state.duplicateSpaces}
            type="service_hold"
          />

          <HoldsLayer
            spaces={this.state.salesHoldSpaces}
            parkingShapes={this.state.parkingShapes}
            skip={this.state.duplicateSpaces}
            type="sales_hold"
          />

          <NoteLayer
            eventShapes={this.state.noteEventSpaces}
            type="noteText"
            text="1"
            zoom={this.state.zoomLevel}
          />
          <VehicleHighlightLayer
            clickedStallPolygon={this.state.clickedStall}
          />

          <Mapbox.UserLocation
            onUpdate={location => {
              if (typeof location !== 'undefined') {
                if (this.state.userLocation !== null) {
                  if (
                    Number(location.coords.latitude).toFixed(5) !==
                      Number(this.state.userLocation.coords.latitude).toFixed(
                        5,
                      ) ||
                    Number(location.coords.longitude).toFixed(5) !==
                      Number(this.state.userLocation.coords.longitude).toFixed(
                        5,
                      )
                  ) {
                    console.log('Update user location Lot View');
                    this.setState({ userLocation: location });
                  }
                } else {
                  console.log('Set Initial Location');
                  this.setState({ userLocation: location });
                }
              }
            }}
          />
        </Mapbox.MapView>

        {this.maybeRenderSearchButton()}
        {this.maybeRenderTextInput()}

        {this.maybeRenderPopulateOnClick()}
        {this.maybeRenderActionFeedbackView()}
        {this.maybeRenderMapControls()}
      </KeyboardAvoidingView>
    );
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
  floatingActionContainer: {
    position: 'absolute',
    right: 30,
    bottom: 80,
    flexDirection: 'column',
  },
  floatingActionButton: {
    width: 66,
    height: 66,
    backgroundColor: '#828282',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#828282',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 20,
    marginBottom: 20,
  },
  floatingTextInputArea: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#828282',
    shadowOffset: { width: 1, height: 1 },
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

const lotLayerStyles = {
  // NOTE: On web all shapes have an opacity of 1 barring parking_lot whose opacity is 0.4
  buildings: {
    fillColor: '#F29836',
    fillOpacity: 1,
  },
  empty_parking_spaces: {
    fillColor: '#FFFFFF',
    fillOpacity: 1,
    fillOutlineColor: 'rgba(255,255,255,1)',
  },
  new_vehicle_occupied_spaces: {
    fillColor: '#9CB6C6',
    fillOpacity: 1,
  },
  new_vehicle_recent_occupied_spaces: {
    fillColor: '#376794',
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
    fillOpacity: 1,
  },
  used_vehicle_occupied_spaces: {
    fillColor: '#C5DB9D',
    fillOpacity: 1,
  },
  used_vehicle_recent_occupied_spaces: {
    fillColor: '#90C055',
    fillOpacity: 1,
  },
  loaner_occupied_spaces: {
    fillColor: '#EBECB4',
    fillOpacity: 1,
  },
  loaner_recent_occupied_spaces: {
    fillColor: '#E6E570',
    fillOpacity: 1,
  },
  lease_occupied_spaces: {
    fillColor: '#C893BC',
    fillOpacity: 1,
  },
  lease_recent_occupied_spaces: {
    fillColor: '#9A5C9D',
    fillOpacity: 1,
  },
  wholesale_occupied_spaces: {
    fillColor: '#C4C2C2',
    fillOpacity: 1,
  },
  wholesale_recent_occupied_spaces: {
    fillColor: '#8D8C88',
    fillOpacity: 1,
  },
  sold_spaces: {
    fillColor: '#000',
    fillOpacity: 1,
  },
};

const debug_location = [37.353285, -122.0079];

const debug_highlight_polygon = {
  geometry: {
    coordinates: [
      [
        [-122.00724072754383, 37.35288456190844],
        [-122.00723871588707, 37.352924805756714],
        [-122.00721139088273, 37.352924805756714],
        [-122.0072128996253, 37.35288456190844],
        [-122.00724072754383, 37.35288456190844],
      ],
    ],
    type: 'Polygon',
  },
  id: '130',
  properties: {},
  type: 'Feature',
};
