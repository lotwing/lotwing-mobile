import React from 'react';
import {
  View,
  Text,
  Platform,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';

import {
  getStatusBarHeight,
  getBottomSpace,
} from 'react-native-iphone-x-helper';

import { RNCamera } from 'react-native-camera';
import BarcodeMask from 'react-native-barcode-mask';

import buttonStyles from '../constants/ButtonStyles';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

import pageStyles from '../constants/PageStyles';
import textStyles from '../constants/TextStyles';

import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 *
 * Lot shapes include:
 * parking_lots, buildings, parking_spaces
 */
export default class TagModalView extends React.Component {
  constructor(props) {
    super(props);

    this.dismissModal = this.dismissModal.bind(this);
    this.tapOutsideModal = this.tapOutsideModal.bind(this);
    this.confirmSpaceData = this.confirmSpaceData.bind(this);
    this.newStallNumber = '- -';
    this.newStockNumber = '- -';

    this.state = {
      loading: true,
      modalContent: this.props.modalType,
      arrayPosition: 0,
      vehicle: null,
      vehicles: [],
      screen: 'default',
      key_board_locations: [],
      mileage: 0,
      mileageOpen: false,
      events: [],
      createView: false,
      vehicleType: null,
      reopenOnDismiss: false,
      drive: { event_id: null, started_at: null, summary: '' },
      fuel: { event_id: null, started_at: null, summary: '' },
      sku: this.props.sku,
      barcodeOpen: true,
      cameraReady: true,
    };
  }
  componentDidMount() {
    console.log('COMPONENT WILL MOUNT Modal Type: ', this.props.modalType);
    if (this.props.modalType !== GlobalVariables.CREATE_MODAL_TYPE) {
      console.log('CALL LOAD VEHICLE from MOUNT');
      this.setState({
        vehicle: null,
        loading: false,
        modalContent: 'empty',
        mileage: null,
        mileageOpen: false,
      });
      //this.loadVehicleData(this.props);
    } else {
      this.setState({
        loading: false,
        createView: false,
        vehicleType: null,
        reopenOnDismiss: false,
        barcodeOpen: false,
        cameraReady: false,
      });
    }
  }

  dismissModal() {
    //this.props.setVehicleHighlight(null);
    this.props.setModalVisibility(false);
    //Keyboard.dismiss()
  }
  tapOutsideModal() {
    console.log('tap outside modal');
    this.props.setVehicleHighlight(null);
    this.props.setModalVisibility(false);
    //Keyboard.dismiss()
  }

  showChooseSpaceView() {
    this.props.setModalVisibility(false, GlobalVariables.CHOOSE_EMPTY_SPACE);
  }

  updateLotAndDismissModal(
    new_stall,
    vehicleId = null,
    sku_number = null,
    vin = null,
    opt_feedbackMsg = null,
  ) {
    this.props.updateLotAndDismissModal(
      new_stall,
      vehicleId,
      sku_number,
      vin,
      opt_feedbackMsg,
    );
    //Keyboard.dismiss()
  }

  structureTagPayload(type, event_details) {
    // expects a valid type: tag, note, test_drive, fuel_vehicle, odometer_update
    let body = {
      tag: {
        vehicle_id: this.state.vehicle !== null ? this.state.vehicle.id : null,
        shape_id: this.props.spaceId,
      },
      event: {
        event_type: type,
        event_details: event_details ? event_details : '',
      },
    };

    return body;
  }

  makeAltViewVisible(contentType) {
    console.log('makeAltViewVisible: ', contentType);
    this.setState({ modalContent: contentType });
  }

  confirmSpaceData() {
    console.log('\nconfirmSpaceData called');
    let space_data = this.structureTagPayload('tag');

    console.log('TAG DATA: ', space_data);

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
        console.log('RESPONSE FROM ConfirmSpaceData: ', responseJson);
        const { parking_space, vehicle } = responseJson;
        const { id, sku, vin } = vehicle;
        this.updateLotAndDismissModal(parking_space.id, id, sku, vin);
      })
      .catch(err => {
        console.log('\nCAUGHT ERROR: \n', err, err.name);
        return err;
      });
  }

  createVehicle(sku, type) {
    console.log('Location:', this.props.spaceId);
    const vehicle = {
      model: 'User created vehicle',
      stock_number: sku,
      creation_source: 'user_created',
      usage_type: type,
      vin: this.props.vin,
    };
    console.log('Created vehicle: ', vehicle);
    this.setState({ loading: true });
    let url = GlobalVariables.BASE_ROUTE + Route.VEHICLE;
    return fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + GlobalVariables.LOTWING_ACCESS_TOKEN,
      },
      body: JSON.stringify(vehicle),
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
        console.log('RETURNED FROM UPDATE_VEHICLE', responseJson);
        this.props.setVehicleId(responseJson.id);
        this.setState({
          vehicle: responseJson,
          createView: false,
          vehicleType: null,
          reopenOnDismiss: true,
        });
        this.confirmSpaceData();
      })
      .catch(err => {
        console.log(
          '\nCAUGHT ERROR IN UPDATE VEHICLE ACTION: \n',
          err,
          err.name,
        );
        return err;
      });
  }

  createVehicleButtons() {
    if (this.props.leaseRt) {
      return (
        <View>
          <Text style={styles.stallHeader}>LAST 5 VIN</Text>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <TouchableOpacity
              style={[
                buttonStyles.activeSecondaryModalButton,
                { flex: 1, margin: 5 },
              ]}
              onPress={() => {
                Alert.alert(
                  'Create Vehicle',
                  `You are creating stock number \n ${this.state.sku} \n as a \n LEASE RETURN`,
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Create Vehicle',
                      onPress: () =>
                        this.createVehicle(this.state.sku, 'lease_return'),
                    },
                  ],
                  { cancelable: true },
                );
              }}>
              <Text style={buttonStyles.activeSecondaryTextColor}>
                CREATE LEASE RT
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return (
      <View>
        <Text style={styles.stallHeader}>STOCK NUMBER</Text>
        {this.props.vin !== null ? (
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <TouchableOpacity
              style={[
                buttonStyles.activeSecondaryModalButton,
                { flex: 1, backgroundColor: '#006699', margin: 5 },
              ]}
              onPress={() => {
                Alert.alert(
                  'Create Vehicle',
                  `You are creating stock number \n ${this.state.sku} \n as a \n NEW VEHICLE`,
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Create Vehicle',
                      onPress: () =>
                        this.createVehicle(this.state.sku, 'is_new'),
                    },
                  ],
                  { cancelable: true },
                );
              }}>
              <Text style={buttonStyles.activeSecondaryTextColor}>NEW</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                buttonStyles.activeSecondaryModalButton,
                { flex: 1, backgroundColor: '#66CC00', margin: 5 },
              ]}
              onPress={() => {
                Alert.alert(
                  'Create Vehicle',
                  `You are creating stock number \n ${this.state.sku} \n as a \n USED VEHICLE`,
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Create Vehicle',
                      onPress: () =>
                        this.createVehicle(this.state.sku, 'is_used'),
                    },
                  ],
                  { cancelable: true },
                );
              }}>
              <Text style={buttonStyles.activeSecondaryTextColor}>USED</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                buttonStyles.activeSecondaryModalButton,
                { flex: 1, backgroundColor: '#E8F051', margin: 5 },
              ]}
              onPress={() => {
                Alert.alert(
                  'Create Vehicle',
                  `You are creating stock number \n ${this.state.sku} \n as a \n LOANER`,
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Create Vehicle',
                      onPress: () =>
                        this.createVehicle(this.state.sku, 'loaner'),
                    },
                  ],
                  { cancelable: true },
                );
              }}>
              <Text style={buttonStyles.activeSecondaryTextColor}>LOANER</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                buttonStyles.activeSecondaryModalButton,
                { flex: 1, backgroundColor: '#8D8C88', margin: 5 },
              ]}
              onPress={() => {
                Alert.alert(
                  'Create Vehicle',
                  `You are creating stock number \n ${this.state.sku} \n as a \n WHOLESALE UNIT`,
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Create Vehicle',
                      onPress: () =>
                        this.createVehicle(this.state.sku, 'wholesale_unit'),
                    },
                  ],
                  { cancelable: true },
                );
              }}>
              <Text style={buttonStyles.activeSecondaryTextColor}>
                WHL UNIT
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: '#FFF' }}>
              Scan to create New, Used or Loaner
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={[
                  buttonStyles.activeSecondaryModalButton,
                  { flex: 3, backgroundColor: '#006699', margin: 5 },
                ]}
                onPress={() => {
                  //this.dismissModal()
                  this.setState({ barcodeOpen: true, cameraReady: true });
                }}>
                <Text style={buttonStyles.activeSecondaryTextColor}>
                  SCAN BARCODE
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  buttonStyles.activeSecondaryModalButton,
                  { flex: 1, backgroundColor: '#8D8C88', margin: 5 },
                ]}
                onPress={() => {
                  Alert.alert(
                    'Create Vehicle',
                    `You are creating stock number \n ${this.state.sku} \n as a \n WHOLESALE UNIT`,
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                      {
                        text: 'Create Vehicle',
                        onPress: () =>
                          this.createVehicle(this.state.sku, 'wholesale_unit'),
                      },
                    ],
                    { cancelable: true },
                  );
                }}>
                <Text style={buttonStyles.activeSecondaryTextColor}>
                  WHL UNIT
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }
  _renderAltActionView() {
    // either stallChange, info, or base
    // car features that can be displayed
    // spaceId, make, model, year, color, sku
    console.log('MODAL CONTENT TYPE: ', this.state.modalContent);
    if (this.state.modalContent == GlobalVariables.INFO_MODAL_TYPE) {
      return (
        <View style={styles.tagModalMainBody}>
          <Text style={styles.header}>
            {this.state.vehicles[this.state.arrayPosition].year}{' '}
            {this.state.vehicles[this.state.arrayPosition].make}{' '}
            {this.state.vehicles[this.state.arrayPosition].model}
          </Text>
          <View style={{ visible: this.state.modalContent }}>
            <View
              style={[
                pageStyles.noteCard,
                { width: '100%', paddingTop: 20, borderRadius: 0 },
              ]}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text style={textStyles.modalDataHeader}>Mileage</Text>
                <Text style={textStyles.modalData}>
                  {this.state.vehicles[this.state.arrayPosition].mileage} miles
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text style={textStyles.modalDataHeader}>Time in Stock</Text>
                <Text style={textStyles.modalData}>
                  {this.state.vehicles[this.state.arrayPosition].age_in_days}{' '}
                  days
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    } else if (this.state.modalContent == GlobalVariables.EMPTY_MODAL_TYPE) {
      //TODO(adwoa): EMPTY_MODAL_TYPE add feedback here
      return (
        <View
          style={[
            styles.tagModalMainBody,
            { width: '100%', borderRadius: 0, paddingTop: 20 },
          ]}>
          <Text style={[textStyles.modalDataHeader, { color: 'white' }]}>
            Populate Empty Space
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View style={{ flex: 1 }}>
              <TextInput
                autoCapitalize="characters"
                multiline={false}
                style={[
                  textStyles.greyBackgroundTextInput,
                  textStyles.largeText,
                  { textAlign: 'center' },
                ]}
                placeholder="Stock Number"
                placeholderTextColor="rgba(237, 235, 232, 0.5)"
                onChangeText={stockNumber => {
                  this.newStockNumber = stockNumber;
                }}
                onSubmitEditing={event =>
                  this.props.updateLotAndDismissModal(
                    this.props.spaceId,
                    null,
                    event.nativeEvent.text,
                    null,
                    'Attempting to Populate Empty Space...',
                  )
                }
                returnKeyType="send"
                autoFocus={true}
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                this.setState({ barcodeOpen: true, cameraReady: true });
              }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}>
                <Ionicons
                  type="ionicon"
                  name={'md-barcode'}
                  size={25}
                  style={{ color: '#FFF' }}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (this.state.modalContent === GlobalVariables.CREATE_MODAL_TYPE) {
      if (this.state.createView) {
        console.log('Vehicle Type: ', this.state.vehicleType);
        return (
          <View
            style={[
              styles.tagModalMainBody,
              { width: '100%', borderRadius: 0 },
            ]}>
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#FFF',
                paddingBottom: 5,
              }}>
              {this.props.vin === null ? (
                <Text
                  style={[
                    styles.stallHeader,
                    { textAlign: 'center', fontSize: 50, fontWeight: 'bold' },
                  ]}>
                  {this.state.sku}
                </Text>
              ) : (
                <TextInput
                  multiline={false}
                  style={[
                    textStyles.greyBackgroundTextInput,
                    textStyles.largeText,
                    {
                      textAlign: 'center',
                      borderBottomWidth: 0,
                      marginBottom: 0,
                    },
                  ]}
                  value={this.state.sku !== null ? `${this.state.sku}` : ''}
                  keyboardType={'default'}
                  onChangeText={sku => this.setState({ sku: sku })}
                  autoFocus={true}
                />
              )}
            </View>
            {this.state.sku !== null &&
              this.state.sku !== '' &&
              this.createVehicleButtons()}
          </View>
        );
      }
      return (
        <View
          style={[
            styles.tagModalMainBody,
            { width: '100%', borderRadius: 0, paddingTop: 20 },
          ]}>
          <View style={pageStyles.rightButtonContainer}>
            <TouchableOpacity
              style={buttonStyles.activeSecondaryModalButton}
              onPress={() => {
                this.tapOutsideModal();
              }}>
              <Text style={buttonStyles.activeSecondaryTextColor}>CLOSE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={buttonStyles.activePrimaryModalButton}
              onPress={() => this.setState({ createView: true })}>
              <Text style={buttonStyles.activePrimaryTextColor}>
                CREATE VEHICLE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }
  onBarCodeRead(e) {
    console.log('camera reading barcode');
    this.setState({ cameraReady: false });
    if (typeof e !== 'undefined') {
      if (typeof e.data === 'string') {
        if (e.data.length > 0) {
          console.log('Barcode: ', e.data);
          this.setState({ barcodeOpen: false, cameraReady: true });
          this.props.updateLotAndDismissModal(
            this.props.spaceId,
            null,
            this.state.sku,
            e.data,
            'Attempting to Populate Empty Space...',
          );
        } else {
          console.log('Barcode error - barcode length is not greater than 0');
          this.setState({ barcodeOpen: false, cameraReady: true });
          this.props.updateLotAndDismissModal(
            this.props.spaceId,
            null,
            null,
            '---',
            'Error reading barcode - Barcode length is zero.',
          );
        }
      } else {
        console.log('Barcode error - e.data is not a string');
        this.setState({ barcodeOpen: false, cameraReady: true });
        this.props.updateLotAndDismissModal(
          this.props.spaceId,
          null,
          null,
          '---',
          'Error reading barcode - Type is not a string.',
        );
      }
    } else {
      console.log('Barcode error - e is undefined');
      this.setState({ barcodeOpen: false, cameraReady: true });
      this.props.updateLotAndDismissModal(
        this.props.spaceId,
        null,
        null,
        '---',
        'Error reading barcode - Data undefined.',
      );
    }
  }

  render() {
    let isBasicModal =
      this.state.modalContent === GlobalVariables.BASIC_MODAL_TYPE;
    let isCreateModal =
      this.state.modalContent === GlobalVariables.CREATE_MODAL_TYPE;
    console.log('Render modal content: ', this.state.modalContent);
    let isOnMap = this.props.spaceId;
    //console.log(this.state.vehicle)
    let vehicleUsageType = '';

    if (
      this.state.vehicle !== null &&
      this.state.vehicle.creation_source === 'user_created'
    ) {
      //console.log(this.state.vehicle)
      let usageType =
        this.state.vehicle.usage_type !== null
          ? this.state.vehicle.usage_type
          : '';
      let modalTitle = '';
      if (usageType === 'is_new') {
        modalTitle = 'New';
      }
      if (usageType === 'is_used') {
        modalTitle = 'Used';
      }
      if (usageType === 'loaner') {
        modalTitle = 'Loaner';
      }
      if (usageType === 'wholesale_unit') {
        modalTitle = 'Wholesale Unit';
      }
      if (usageType === 'lease_return') {
        modalTitle = 'Lease Return';
      }
    }

    if (this.state.loading) {
      return (
        <KeyboardAvoidingView
          style={styles.tagModalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          enabled
          keyboardVerticalOffset={
            getStatusBarHeight(true) + GlobalVariables.HEADER_HEIGHT
          }>
          <TouchableWithoutFeedback
            onPress={() => {
              this.props.findOnMap(false);
            }}>
            <View style={styles.tagModalBlankSpace} />
          </TouchableWithoutFeedback>

          <View style={styles.modalBottomContainer}>
            <View style={styles.tagModalStallBar}>
              <Text style={styles.stallHeader}>LOADING...</Text>
            </View>
            <View
              style={[
                styles.tagModalMainBody,
                {
                  paddingTop: 30,
                  paddingBottom: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}>
              <ActivityIndicator size="large" color="#FFF" />
            </View>
          </View>
        </KeyboardAvoidingView>
      );
    }
    if (this.state.barcodeOpen) {
      return (
        <View style={{ flex: 1, backgroundColor: '#FFF' }}>
          <View
            style={{
              flex: 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 10,
            }}>
            <Text style={{ fontWeight: 'bold' }}>Scan Barcode</Text>
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

    return (
      <KeyboardAvoidingView
        style={styles.tagModalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={
          getStatusBarHeight(true) + GlobalVariables.HEADER_HEIGHT
        }>
        <TouchableWithoutFeedback
          onPress={() => {
            console.log('TOUCHING --OUTER-- VIEW');
            this.tapOutsideModal();
          }}>
          <View style={styles.tagModalBlankSpace} />
        </TouchableWithoutFeedback>

        <View style={styles.modalBottomContainer}>
          <View
            style={[
              styles.tagModalStallBar,
              { borderBottomWidth: 0, height: 'auto' },
            ]}
          />
          {isCreateModal ? (
            <View
              style={[
                styles.tagModalStallBar,
                {
                  borderTopWidth: 0,
                  height: 'auto',
                  paddingTop: 10,
                  paddingBottom: 10,
                },
              ]}>
              <Text style={styles.stallHeader}>
                {' '}
                Vehicle not found: {this.props.vin === null &&
                  this.state.sku}{' '}
                {this.props.vin !== null && `VIN: ${this.props.vin}`}
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.tagModalStallBar,
                {
                  borderTopWidth: 0,
                  height: 'auto',
                  paddingTop: 10,
                  paddingBottom: 10,
                },
              ]}>
              <Text style={styles.stallHeader}>- -</Text>
              <Text style={styles.stallHeader}>Multi-add</Text>
            </View>
          )}

          {this._renderAltActionView()}
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    fontSize: 18,
    fontWeight: '100',
    color: '#E6E4E0',
    paddingBottom: 5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '200',
    color: '#E6E4E0',
  },
  stallHeader: {
    fontSize: 20,
    fontWeight: '300',
    color: 'white',
    borderTopWidth: 4,
    borderBottomWidth: 3,
  },
  tagModalOverlay: {
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  tagModalBlankSpace: {
    height: '70%',
  },
  modalBottomContainer: {
    elevation: 1,
    shadowColor: '#00000050',
    shadowOpacity: 50,
    shadowRadius: 10,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  tagModalStallBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    height: 49,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: 'white',
    borderBottomColor: 'white',
    borderRightWidth: 10,
    borderRightColor: '#828282',
    backgroundColor: '#828282',
    paddingLeft: 5,
  },
  tagModalMainBody: {
    flexDirection: 'column',
    backgroundColor: '#828282',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    borderWidth: 14,
    borderColor: '#828282',
    paddingBottom: getBottomSpace(),
  },
  tagButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderWidth: 5,
    borderTopWidth: 12,
    borderBottomWidth: 10,
    borderColor: '#828282',
  },
  tagModalTabs: {
    flexDirection: 'row',
  },
  tagModalTab: {
    padding: 10,
    backgroundColor: '#828282',
  },
});
