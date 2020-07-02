import React from 'react';
import {
  AsyncStorage,
  Keyboard,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
  View,
  Dimensions,
  Platform,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';
import VehicleSpaceLayer from '../components/VehicleSpaceLayer';
import VehicleHighlightLayer from '../components/VehicleHighlightLayer';
import TempVehicleSpaceLayer from '../components/TempVehicleSpaceLayer';
import BuildingLayer from '../components/BuildingLayer';
import LandscapingLayer from '../components/LandscapingLayer';
import LastTaggedLayer from '../components/LastTaggedLayer';
import MultiModal from '../components/MultiModal';
import ActionFeedbackView from '../components/ActionFeedbackView';
import LotActionHelper from '../helpers/LotActionHelper';

import Mapbox from '@react-native-mapbox-gl/maps';

/**
 *
 * Lot shapes include:
 * parking_lots, buildings, parking_spaces
 */
export default class MultiScreen extends React.Component {
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
      initialLoad: [],
      centerCoordinate: lotCenterCoordinates,
      userLocation: { coords: lotCenterCoordinates },
      lotShapes: null,
      errorLoading: false,
      newVehicleSpaces: [],
      usedVehicleSpaces: [],
      emptySpaces: [],
      loanerSpaces: [],
      leaseSpaces: [],
      wholesaleSpaces: [],
      soldSpaces: [],
      parkingShapes: {},
      spaceVehicleMap: {},
      spaceId: 0,
      clickedStall: null,
      modalVisible: false,
      modalType: GlobalVariables.EMPTY_MODAL_TYPE,
      feedbackText: 'Populating space...',
      key_board: null,
      key_board_locations: [],
      key_board_open: false,
      sku: null,
      vin: null,
      leaseRt: false,
      vehicles: [],
      vehicleId: 0,
      zoomLevel: 20,
      tempClickedStall: null,
      previousClickedStall: [],
      previousScanId: [],
    };
    let loadPromise = this._loadLotView();
    loadPromise.then(result => {
      console.log('PROMISE RESOLVED: ', result);
      if (result && result.name == 'Error') {
        console.log('Routing back to login page!', this.props);
        this.props.navigation.navigate('Auth');
      }
    });

    this.setVehicleHighlight = this.setVehicleHighlight.bind(this);
    this.dismissInput = this.dismissInput.bind(this);
    this._loadLotView = this._loadLotView.bind(this);
  }

  componentWillMount() {
    this.props.navigation.setParams({
      section: 'multi',
      onPress: () => {
        this.setState({ newVehicleSpaces: [], usedVehicleSpaces: [] });
      },
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.navigation.state.params.resetValues === true) {
      this.setState({ newVehicleSpaces: [], usedVehicleSpaces: [] });
    }
  }
  _loadLotView() {
    var lotview = this;
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
        if (
          responseJson.message &&
          responseJson.message === GlobalVariables.AUTHORISATION_FAILED
        ) {
          console.log('Authentication Failed');
          this.props.navigation.navigate('Auth');
        }
        console.log('\nLOADLOTVIEW RESPONSE: ', responseJson.message, '\n');
        if (responseJson.message == 'Signature has expired') {
          console.log('Throwing Error');
          throw Error('Unauthorized user');
        }

        GlobalVariables.LOT_DATA = responseJson;
        // TODO(adwoa): ask question about how multiple parking lots are listed and sorted within the get lot response
        let lot_geometry =
          GlobalVariables.LOT_DATA.parking_lots[0].geo_info.geometry;
        let lot_coords = lot_geometry.coordinates[0];

        let lotParkingSpaceMap = {};
        GlobalVariables.LOT_DATA.parking_spaces.forEach(space => {
          lotParkingSpaceMap[space.id] = space;
        });
        lotview.loadKeyBoardData();
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
        if (
          responseJson.message &&
          responseJson.message === GlobalVariables.AUTHORISATION_FAILED
        ) {
          console.log('Authentication Failed');
          this.props.navigation.navigate('Auth');
        }
        // only saying space ids not saving most_recently_tagged_at which is also returned
        let allSpaces = [];
        let results = [
          responseJson.new_vehicle_occupied_spaces,
          responseJson.used_vehicle_occupied_spaces,
          responseJson.empty_parking_spaces,
          responseJson.loaner_occupied_spaces,
          responseJson.lease_return_occupied_spaces,
          responseJson.wholesale_unit_occupied_spaces,
          responseJson.sold_vehicle_spaces,
        ];
        results.forEach(result => {
          result.forEach(space => {
            if (!allSpaces.some(allspace => allspace.id === space.id)) {
              allSpaces.push(space.id);
            }
          });
        });
        lotview.setState({
          initialLoad: responseJson,
          emptySpaces: allSpaces,
          newVehicleSpaces: [],
          usedVehicleSpaces: [],
          loanerSpaces: [],
          leaseSpaces: [],
          wholesaleSpaces: [],
          soldSpaces: [],
          centerCoordinate,
          lotShapes: GlobalVariables.LOT_DATA,
          parkingShapes,
          errorLoading: false,
          modalVisible: false,
          spaceVehicleMap: {},
          feedbackText: '',
        });

        this.updateSpaceVehicleMap = false;
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
      if (
        modalType == GlobalVariables.ACTION_FEEDBACK_MODAL_TYPE &&
        visibility == false &&
        opt_basic_modal_action_fb_msg
      ) {
        textToShow = opt_basic_modal_action_fb_msg;
      }
      this.setState({
        modalVisible: visibility,
        modalType: modalType,
        feedbackText: textToShow,
      });
    } else {
      this.setState({
        modalVisible: visibility,
        modalType: GlobalVariables.BASIC_MODAL_TYPE,
      });
    }
  }

  setPopulateViewVisibility(visibility, modalType = null, vehicleId = null) {
    this.setState({
      modalVisible: visibility,
      modalType: modalType,
      // feedbackText: textToShow,
    });
  }

  setLocalHighlight(spaceId, vehicle) {
    console.log('Set local highlight: ', spaceId);
    let usedSpaces = [];
    let newSpaces = [];
    let previousScans = [];
    let previousStalls = [];
    this.state.usedVehicleSpaces.forEach(uspace => usedSpaces.push(uspace));
    this.state.newVehicleSpaces.forEach(nspace => newSpaces.push(nspace));
    this.state.previousClickedStall.forEach(stall =>
      previousStalls.push(stall),
    );
    this.state.previousScanId.forEach(id => previousScans.push(id));
    let tempVehicleSN = '';
    if (vehicle !== null) {
      console.log('Usage type: ', vehicle.usage_type);
      if (vehicle.usage_type === 'is_new') {
        //console.log('RememberJson: ', this.state.initialLoad["new_vehicle_occupied_spaces"])
        newSpaces.push(spaceId);
      } else {
        //console.log('RememberJson: ', this.state.initialLoad["used_vehicle_occupied_spaces"])
        usedSpaces.push(spaceId);
      }
      tempVehicleSN = vehicle.stock_number;
      console.log('Vehicle: ', vehicle);
      previousScans.unshift(tempVehicleSN);
      previousStalls.unshift(this.state.tempClickedStall);
      this.setState({
        previousScanId: [],
        previousClickedStall: [],
      });
      console.log(
        'Previous Scans: ',
        previousScans,
        'Previous Stalls: ',
        previousStalls,
      );
    } else {
      //usedSpaces.push(spaceId);
      this.setState({
        feedbackText: 'Error loading vehicle',
        //previousScanId: '',
      });
    }
    if (this.state.key_board !== null) {
      let url = GlobalVariables.BASE_ROUTE + Route.VEHICLE + vehicle.id;
      return fetch(url, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + GlobalVariables.LOTWING_ACCESS_TOKEN,
        },
        body: JSON.stringify({ key_board_location_name: this.state.key_board }),
      })
        .then(response => {
          this.setState({
            usedVehicleSpaces: usedSpaces,
            newVehicleSpaces: newSpaces,
            modalType: GlobalVariables.EMPTY_MODAL_TYPE,
            modalVisible: false,
            previousScanId: previousScans,
            previousClickedStall: previousStalls,
          });
        })
        .catch(err => {
          console.log(
            '\nCAUGHT ERROR IN UPDATE VEHICLE ACTION: \n',
            err,
            err.name,
          );
          return err;
        });
    } else {
      this.setState({
        usedVehicleSpaces: usedSpaces,
        newVehicleSpaces: newSpaces,
        modalType: GlobalVariables.EMPTY_MODAL_TYPE,
        modalVisible: false,
        previousScanId: previousScans,
        previousClickedStall: previousStalls,
      });
    }
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
    console.log('tempHighlight: ', tempHighlight);
    this.setState({ tempClickedStall: tempHighlight });
    //this.setState({ previousClickedStall: null, previousScanId: '' });
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
        //console.log('STALL UPDATE RESULT from vehicle ID: ', result);
        // 3. Re-render lot by updating state
        this.setLocalHighlight(this.state.spaceId, result.vehicle);
        //this.setState({ previousClickedStall: tempHighlight });
      });
    } else if (vin) {
      console.log('VIN ENTERED: updating');
      this.vinEntered = vin;
      this.skuEntered = sku_number;
      this.setState({ sku: this.skuEntered, vin: this.vinEntered });
      if (this.vinEntered === '---') {
        this.setState({
          feedbackText: 'Barcode cannot be read.',
          //previousScanId: '',
        });
      } else if (this.vinEntered.length !== 17) {
        this.setState({
          feedbackText:
            'VIN must be 17 character long. \nEntered Vin: ' + this.vinEntered,
          //previousScanId: '',
        });
      } else {
        let vehiclePromise = this._getVehicleByType('vin');
        vehiclePromise
          .then(vehicleData => {
            if (vehicleData.vehicle === null) {
              this.setModalVisibility(
                true,
                GlobalVariables.CREATE_MODAL_TYPE,
                null,
                null,
              );
              this.setVehicleHighlight(tempHighlight);
            } else {
              return this.updateStallNumber(new_stall, vehicleData.vehicle.id);
            }
          })
          .then(result => {
            console.log('STALL UPDATE from VIN');
            // 3. Re-render lot by updating state
            if (result !== undefined) {
              console.log('VIN result is not undefined.');
              this.setLocalHighlight(this.state.spaceId, result.vehicle);
            } else {
              console.log('result is undefined', this.state.modalType);
              this.setState({
                feedbackText: 'Vin result is undefined',
                //previousScanId: '',
              });
            }
          })
          .catch(err => {
            this.setState({
              feedbackText: 'Error in fetching vehicle by vin',
              //previousScanId: '',
            });
            console.log('Error in fetching vehicle by vin', err);
            return false;
          });
      }
      //this.setState({ previousClickedStall: tempHighlight });
    } else if (sku_number) {
      console.log('SKU ENTERED: updating');
      this.skuEntered = sku_number;
      this.vinEntered = null;
      this.setState({ sku: this.skuEntered, vin: this.vinEntered });
      let vehiclePromise = this._getVehicleByType('sku');

      vehiclePromise
        .then(vehicleData => {
          //console.log('Vehicle data from updateLotAndDismissModal: ', vehicleData)
          if (vehicleData.vehicle === null) {
            this.setModalVisibility(
              true,
              GlobalVariables.CREATE_MODAL_TYPE,
              null,
              null,
            );
            this.setVehicleHighlight(tempHighlight);
          } else {
            return this.updateStallNumber(new_stall, vehicleData.vehicle.id);
          }
        })
        .then(result => {
          //console.log('STALL UPDATE RESULT from SKU: ', result);
          // 3. Re-render lot by updating state
          if (result !== undefined) {
            console.log(
              'result is not undefined. Vehicle id: ',
              result.vehicle.id,
              'space id: ',
              this.state.spaceId,
            );
            this.setLocalHighlight(this.state.spaceId, result.vehicle);
            //console.log('Previous stall: ', this.state.previousClickedStall);
          } else {
            this.setState({
              feedbackText: 'Stock number result is undefined',
              //previousScanId: '',
            });
            console.log('result is undefined', this.state.modalType);
          }
          //this.setState({ previousClickedStall: tempHighlight });
        })
        .catch(err => {
          this.setState({
            feedbackText: 'Error in fetching vehicle by stock number',
            //previousScanId: '',
          });
          return false;
        });
    } else {
      this.setState({
        feedbackText: 'Error in fetching vehicle',
        //previousScanId: '',
      });
      console.log('not vehicleID or sku_number');
      //this.setLocalHighlight(this.state.spaceId, null);
    }
  };
  updateLotAndReopenModal = space_id => {
    const tempHighlight = this.state.clickedStall;
    this.setState({
      modalReopen: true,
      modalReopenTarget: space_id,
      modalReopenHighlight: tempHighlight,
    });
    this.updateLotAndDismissModal(null, null, null, null, 'Updating Lot...');
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
        if (
          responseJson.message &&
          responseJson.message === GlobalVariables.AUTHORISATION_FAILED
        ) {
          console.log('Authentication Failed');
          this.props.navigation.navigate('Auth');
        }
        //console.log(responseJson);
        return responseJson;
      })
      .catch(err => {
        this.setState({ feedbackText: 'Error in updating stall number' });
        console.log('\nCAUGHT ERROR IN UPDATESTALLNUMBER: \n', err, err.name);
        //TODO(adwoa): make save button clickable again
        return err;
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
    if (space_id === null) {
      // special case where we don't have a space id
      this.setState({ vehicles: vehiclesArray });
    }

    this.setState({
      spaceId: space_id,
    });
  }

  setVehicleHighlight(polygonClicked) {
    let centerCoordinate = this.state.centerCoordinate;
    console.log('SET VEHICLE HIGHLIGHT: ', polygonClicked);
    this.setState({ clickedStall: polygonClicked });
    if (polygonClicked !== null) {
      centerCoordinate = this._calculateCenter(
        polygonClicked.geometry.coordinates[0],
      );
    }
    console.log('SET VEHICLE HIGHLIGHT: ', centerCoordinate);
    this.setState({ centerCoordinate: centerCoordinate });
  }

  findOnMap = boolean => {
    this.setState({ findingOnMap: boolean });
  };

  showAndPopulateModal = (data, polygonClicked) => {
    let [space_id, vehicleData] = data;
    //console.log(space_id);
    // Highlight selected stall
    // 1. Pass polygon clicked or searched for here in order to highlight
    if (polygonClicked) {
      this.setVehicleHighlight(polygonClicked);
    } else {
      this.setVehicleHighlight(null);
    }
    // Display Proper Modal and Highlight selected stall
    if (this.state.modalType != GlobalVariables.CHOOSE_EMPTY_SPACE) {
      this.setState({ leaseRt: false, sku: null });
      this.setModalValues(GlobalVariables.EMPTY_MODAL_TYPE, space_id);
      this.setModalVisibility(true, GlobalVariables.EMPTY_MODAL_TYPE);
    } else {
      // Show Add Vehicle to highlighted space message
      this.populateStall(space_id);
    }
  };

  populateStall(space_id) {
    if (space_id) {
      this.setState({
        clickToPopulateStall: space_id,
        feedbackText: 'Populating stall ' + space_id + '...',
      });

      console.log(
        ' - - - - - IN UPDATE LOT AND DISMISS ON CLICK POPULATE VIEW',
      );
      console.log('VEHICLE ID: ', this.state.vehicleId);
      // 2. Update Stall Number & Fetch updated lot
      if (this.state.vehicleId) {
        console.log('VEHICLE ID ENTERED: updating');
        let stallUpdatedPromise = this.updateStallNumber(
          space_id,
          this.state.vehicleId,
        );

        stallUpdatedPromise.then(result => {
          // 3. Re-render lot by updating state
          this.updateLotAndReopenModal(space_id);
          //this.updateSpaceVehicleMap = true;
          //return this._loadLotView();
        });
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

  _getVehicleByType(type) {
    //this.setState({ vin: vin })
    //this.setState({ previousClickedStall: null });
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
        if (
          responseJson.message &&
          responseJson.message === GlobalVariables.AUTHORISATION_FAILED
        ) {
          console.log('Authentication Failed');
          this.props.navigation.navigate('Auth');
        }
        console.log('VEHICLE PULLED FROM STORE');
        const { current_parking_space, vehicle, events } = responseJson;
        //console.log('Updated space: ', current_parking_space);
        //console.log('CLICKED STALL: ', this.state.clickedStall);
        //this.setState({ previousClickedStall: current_parking_space });
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
        this.setState({ feedbackText: 'Error in sending vehicle information' });
        return false;
      });
  }

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

  loadKeyBoardData() {
    let url = GlobalVariables.BASE_ROUTE + Route.KEY_BOARD_LOCATIONS;
    console.log('MODAL: KEY BOARD LOCATION: ', url);
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Bearer ' + GlobalVariables.LOTWING_ACCESS_TOKEN,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(result => {
        if (
          result.message &&
          result.message === GlobalVariables.AUTHORISATION_FAILED
        ) {
          console.log('Authentication Failed');
          this.props.navigation.navigate('Auth');
        }
        console.log('\nRETURNED KEY LOCATIONS DATA: ', result);
        if (result.length) {
          this.setState({ key_board_locations: result });
        }
      });
  }

  _renderTagModal() {
    console.log('Render Tag Modal View: ', this.state.modalType);
    let stockNumberToDisplay =
      this.state.modalType == GlobalVariables.BASIC_MODAL_TYPE
        ? this.state.stockNumber
        : null;
    if (this.state.modalVisible) {
      return (
        <View
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
          <MultiModal
            modalType={this.state.modalType}
            spaceId={this.state.spaceId}
            style={styles.tagModalInnerView}
            modalStyling={styles.tagModalStyles}
            navigation={this.props.navigation}
            setModalVisibility={this.setVisibility}
            updateLotAndDismissModal={this.updateLotAndDismissModal}
            updateLotAndReopenModal={this.updateLotAndReopenModal}
            setVehicleHighlight={this.setVehicleHighlight}
            vehicles={this.state.vehicles}
            sku={this.state.sku}
            vin={this.state.vin}
            leaseRt={this.state.leaseRt}
            setVehicleId={this.setModalId}
          />
        </View>
      );
    }
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
  maybeRenderKeyboard() {
    if (this.state.key_board_locations.length > 0) {
      return (
        <View
          style={{
            position: 'absolute',
            zIndex: 10,
            elevation: 10,
            width: Dimensions.get('window').width - 100,
            left: 20,
            top: 40,
            backgroundColor: '#828282',
            borderRadius: 10,
          }}>
          <TouchableOpacity
            onPress={() =>
              this.setState({ key_board_open: !this.state.key_board_open })
            }>
            <View style={{ padding: 10, paddingLeft: 14, paddingRight: 14 }}>
              <Text style={{ color: '#FFF' }}>
                {this.state.key_board !== null
                  ? `KEY BOARD LOCATION: ${this.state.key_board}`
                  : 'SELECT A KEY BOARD'}
              </Text>
            </View>
          </TouchableOpacity>
          {this.state.key_board_open && (
            <View>
              {this.state.key_board_locations.map(keylocation => {
                return (
                  <TouchableOpacity
                    key={keylocation.id}
                    onPress={() =>
                      this.setState({
                        key_board: keylocation.name,
                        key_board_open: false,
                      })
                    }>
                    <View
                      style={[
                        { padding: 10, paddingLeft: 14, paddingRight: 14 },
                        keylocation.name === this.state.key_board && {
                          backgroundColor: '#727272',
                        },
                      ]}>
                      <Text style={{ color: '#FFF' }}>{keylocation.name}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      );
    }
  }
  maybeRenderMapControls() {
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
            onPress={() => {
              if (this.state.userLocation !== null) {
                this.setState({
                  centerCoordinate: [
                    this.state.userLocation.coords.longitude,
                    this.state.userLocation.coords.latitude,
                  ],
                });
              }
            }}
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
    if (typeof r !== 'undefined' && typeof this._map !== 'undefined') {
      const zoom = await this._map.getZoom();
      const center = await this._map.getCenter();
      this.setState({ zoomLevel: zoom, centerCoordinate: center });
    }
  }
  render() {
    const lot = this.getLot();
    const populated = lot.id !== 'empty_geojson';

    //console.log('STATE: Previous stall: ', this.state.previousClickedStall, 'Previous ID: ', this.state.previousScanId);
    if (populated) {
      return (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={styles.container}
          enabled
          keyboardVerticalOffset={
            getStatusBarHeight(true) + GlobalVariables.HEADER_HEIGHT
          }>
          <StatusBar barStyle="light-content" backgroundColor="#BE1E2D" />

          {this.state.modalVisible && this._renderTagModal()}
          {this.maybeRenderKeyboard()}
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

            <Mapbox.ShapeSource id="parking_lot" shape={lot}>
              <Mapbox.FillLayer
                id="fill_parking_lot"
                style={lotLayerStyles.parking_lot}
              />
            </Mapbox.ShapeSource>

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
              style={lotLayerStyles.new_vehicle_recent_occupied_spaces}
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
              ids={this.state.usedVehicleSpaces}
              style={lotLayerStyles.used_vehicle_recent_occupied_spaces}
              parkingShapes={this.state.parkingShapes}
              spaces={this.state.usedVehicleSpaces}
              sendMapCallback={this.getMapCallback}
              showAndPopulateModal={this.showAndPopulateModal}
              updateSpaceVehicleMap={this.updateSpaceVehicleMap}
              updateEvents={this.postLoadEvents}
              type="used_vehicle"
              recent={false}
              blank={this.state.findingOnMap}
            />

            <VehicleHighlightLayer
              clickedStallPolygon={this.state.clickedStall}
            />
            {this.state.previousClickedStall.length > 0 &&
              this.state.previousScanId.length > 0 && (
                <LastTaggedLayer
                  eventShapes={this.state.previousClickedStall[0]}
                  type="noteText"
                  text={this.state.previousScanId[0]}
                  zoom={this.state.zoomLevel}
                />
              )}
            {this.state.previousClickedStall.length > 1 &&
              this.state.previousScanId.length > 1 && (
                <LastTaggedLayer
                  eventShapes={this.state.previousClickedStall[1]}
                  type="noteTexttwo"
                  text={this.state.previousScanId[1]}
                  zoom={this.state.zoomLevel}
                />
              )}
            <Mapbox.UserLocation
              onUpdate={location => {
                if (
                  location !== undefined &&
                  (Number(location.coords.latitude).toFixed(5) !==
                    Number(this.state.userLocation.coords.latitude).toFixed(
                      5,
                    ) ||
                    Number(location.coords.longitude).toFixed(5) !==
                      Number(this.state.userLocation.coords.longitude).toFixed(
                        5,
                      ))
                ) {
                  console.log('Update User Location Multi');
                  this.setState({ userLocation: location });
                }
              }}
            />
          </Mapbox.MapView>

          {this.maybeRenderActionFeedbackView()}
          {this.maybeRenderMapControls()}
        </KeyboardAvoidingView>
      );
    }
    return null;
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
    fillOpacity: 0.75,
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
