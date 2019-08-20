import React from 'react';
import {
  Animated,
  View,
  ScrollView,
  Text,
  TextInput,
  Button,
  Image,
  Platform,
  StyleSheet,
  ActionSheetIOS,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Constants } from 'expo';

import buttonStyles from '../constants/ButtonStyles';

import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

import Mapbox from '@mapbox/react-native-mapbox-gl';

import pageStyles from '../constants/PageStyles';
import textStyles from '../constants/TextStyles';

import Ionicons from 'react-native-vector-icons/Ionicons';

import LotActionHelper from '../helpers/LotActionHelper';
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
      drive: { event_id: null, started_at: null, user_id: null },
      fuel: { event_id: null, started_at: null, user_id: null }
    }
  }
  componentWillMount() {
    console.log('COMPONENT WILL MOUNT Modal Type: ', this.props.modalType)
    if (this.props.modalType !== GlobalVariables.CREATE_MODAL_TYPE) {
      console.log('CALL LOAD VEHICLE from MOUNT')
      this.loadVehicleData(this.props);
    } else {
      this.setState({ loading: false, createView: false, vehicleType: null, reopenOnDismiss: false})
    }
  }

  loadVehicleData(props) {
    const { spaceId, vehicles } = props
    if (spaceId === null) {
      if (vehicles.length) {
        this.setState({
          vehicles: vehicles,
          vehicle: vehicles[this.state.arrayPosition],
          mileage: vehicles[this.state.arrayPosition].mileage,
          screen: 'default',
          mileageOpen: false,
          loading: false,
          reopenOnDismiss: false,
          modalContent: GlobalVariables.BASIC_MODAL_TYPE
        })
      }
    } else {
      let url = GlobalVariables.BASE_ROUTE + Route.VEHICLE_BY_SPACE + spaceId;
      console.log('MODAL: LOAD VEHICLE DATA: ', url);
      return fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer '+ GlobalVariables.LOTWING_ACCESS_TOKEN,
        },
      })
      .then((response) => {
          return response.json();
      })
      .then((result) => {
        //console.log('\nRETURNED VEHICLE DATA: ', result.vehicles);
        //console.log(result)
        if (result.vehicles.length) {

          let drive = {};
          let fuel = {};
          result.events!== null && result.events[0].forEach((event) => {
            console.log('EVENT: ', event.data)
            const { event_type, started_at, ended_at, id } = event.data.attributes
            if (event_type === GlobalVariables.BEGIN_DRIVE && started_at !== null && ended_at === null ) {
              drive = { event_id: id, started_at: started_at }
            }
            if (event_type === GlobalVariables.BEGIN_FUELING && started_at !== null && ended_at === null ) {
              fuel = { event_id: id, started_at: started_at }
            }
          })
          this.setState({
            vehicles: result.vehicles,
            vehicle: result.vehicles[this.state.arrayPosition],
            mileage: result.vehicles[this.state.arrayPosition].mileage,
            screen: 'default',
            mileageOpen: false,
            loading: false,
            events: result.events,
            modalContent: GlobalVariables.BASIC_MODAL_TYPE,
            drive: drive,
            fuel: fuel
          });
          this.props.setVehicleId(result.vehicles[this.state.arrayPosition].id, result.vehicles)
        } else {
          console.log('load vehicle data: ', props.modalContent)
          this.setState({vehicle: null, loading: false, modalContent: 'empty', mileage: null, mileageOpen: false })
        }
      })
    }
  }

  loadKeyBoardData() {
    this.setState({ loading: true });
    let url = GlobalVariables.BASE_ROUTE + Route.KEY_BOARD_LOCATIONS;
    console.log('MODAL: KEY BOARD LOCATION: ', url);
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer '+ GlobalVariables.LOTWING_ACCESS_TOKEN,
      },
    })
    .then((response) => {
        return response.json();
    })
    .then((result) => {
      console.log('\nRETURNED KEY LOCATIONS DATA: ', result);
      if (result.length) {
        this.setState({
          key_board_locations: result,
          loading: false
        });
      } else {
        this.setState({loading: false })
      }
    })
  }

  dismissModal() {
    //this.props.setVehicleHighlight(null);
    this.props.setModalVisibility(false);
    //Keyboard.dismiss()
  }
  tapOutsideModal() {
    console.log('tap outside modal')
    this.props.setVehicleHighlight(null);
    this.props.setModalVisibility(false);
    //Keyboard.dismiss()
  }

  showChooseSpaceView() {
    this.props.setModalVisibility(false, GlobalVariables.CHOOSE_EMPTY_SPACE);
  }

  updateLotAndDismissModal() {
    this.props.updateLotAndDismissModal();
    //Keyboard.dismiss()
  }

  structureTagPayload(type, event_details) {
    // expects a valid type: tag, note, test_drive, fuel_vehicle, odometer_update
    let body = {
      'tag': {'vehicle_id': this.state.vehicle !== null ? this.state.vehicle.id : null, 'shape_id': this.props.spaceId},
      'event': {'event_type': type, 'event_details': event_details ? event_details : ''}
    }

    return body
  }

  makeAltViewVisible(contentType) {
    console.log('makeAltViewVisible: ', contentType)
    this.setState({modalContent: contentType});
  }

  confirmSpaceData() {
    console.log('\nconfirmSpaceData called');
    let space_data = this.structureTagPayload('tag');

    console.log('TAG DATA: ', space_data);

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
        if (this.state.reopenOnDismiss) {
          this.setState({reopenOnDismiss: false })
          this.props.updateLotAndReopenModal(this.props.spaceId)
        } else {
          this.updateLotAndDismissModal();
        }
      })
      .catch(err => {
        console.log('\nCAUGHT ERROR: \n', err, err.name);
        return err
      });
  }

  launchPage(page_name) {
    //this.dismissModal();
    //console.log('Vehicle: ',this.state.vehicles[this.state.arrayPosition])
    if (page_name == 'drive') {
      this.props.navigation.navigate('Drive', { props: this.props, space_id: this.props.spaceId, vehicles: this.state.vehicles, position: this.state.arrayPosition, eventId: this.state.drive.event_id, started_at: this.state.drive.started_at});
    } else if (page_name === 'fuel') {
      this.props.navigation.navigate('Fuel', { props: this.props, space_id: this.props.spaceId, vehicles: this.state.vehicles, position: this.state.arrayPosition, eventId: this.state.fuel.event_id, started_at: this.state.fuel.started_at});
    } else if (page_name === 'note') {
      this.props.navigation.navigate('Note', { props: this.props, space_id: this.props.spaceId, vehicles: this.state.vehicles, position: this.state.arrayPosition});
    } else if (page_name === 'history') {
      this.props.navigation.navigate('History', { space_id: this.props.spaceId, vehicle: this.state.vehicle, position: this.state.arrayPosition});
    }
  }

  updateVehicle(object) {
    this.setState({ loading: true });
    url = GlobalVariables.BASE_ROUTE + Route.VEHICLE + this.state.vehicle.id
    console.log('UPDATE VEHICLE: ', url, JSON.stringify(object))
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+ GlobalVariables.LOTWING_ACCESS_TOKEN,
      },
      body: JSON.stringify(object),
    })
    .then((response) => {
        console.log('RETURNED FROM UPDATE_VEHICLE', response);

        console.log('CALL LOAD VEHICLE from UPDATE VEHICLE')
        this.loadVehicleData(this.props)
    })
    .catch(err => {
      console.log('\nCAUGHT ERROR IN UPDATE VEHICLE ACTION: \n', err, err.name);
      return err
    })
  }

  updateOdo(val) {
    this.setState({ loading: true });
    let payload = {
      'tag': {'vehicle_id': this.state.vehicle !== null ? this.state.vehicle.id : null, 'shape_id': this.props.spaceId},
      'event': {'event_type': GlobalVariables.ODO_UPDATE, 'event_details': val }
    }
    LotActionHelper.registerTagAction(payload)
      .then((response) => {
        console.log('RETURNED FROM updateOdo', response);
        console.log('CALL LOAD VEHICLE from updateOdo')
        this.loadVehicleData(this.props)
      })
      .catch(err => {
          console.log('\nCAUGHT ERROR IN ODOMETER UPDATE: \n', err, err.name);
          return err
      });
  }
  createVehicle(sku, type) {
    console.log('Location:', this.props.spaceId)
    const vehicle =  {model: 'User created vehicle', stock_number: sku, creation_source: 'user_created', usage_type: type }
    console.log(vehicle)
    this.setState({ loading: true });
    url = GlobalVariables.BASE_ROUTE + Route.VEHICLE
    return fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+ GlobalVariables.LOTWING_ACCESS_TOKEN,
      },
      body: JSON.stringify(vehicle),
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log('RETURNED FROM UPDATE_VEHICLE', responseJson);
      this.props.setVehicleId(responseJson.id)
      this.setState({
        vehicle: responseJson,
        createView: false,
        vehicleType: null,
        reopenOnDismiss: true
      });
      if (this.props.spaceId === null) {
        this.showChooseSpaceView()
      } else {
        this.confirmSpaceData()
      }
      //this.loadVehicleData(this.props.spaceId)
      //this.setState({ loading: false });
    })
    .catch(err => {
      console.log('\nCAUGHT ERROR IN UPDATE VEHICLE ACTION: \n', err, err.name);
      return err
    })
  }

  createVehicleButtons() {
    if (this.props.leaseRt) {
      return(
        <View>
          <Text style={ styles.stallHeader }>LAST 5 VIN</Text>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <TouchableOpacity
              style={[buttonStyles.activeSecondaryModalButton, { flex: 1, margin: 5 }]}
              onPress={() => this.createVehicle( this.props.sku, 'lease_return' ) }
            >
              <Text style={buttonStyles.activeSecondaryTextColor}>CREATE LEASE RT</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return (
      <View>
        <Text style={ styles.stallHeader }>STOCK NUMBER</Text>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <TouchableOpacity
            style={[buttonStyles.activeSecondaryModalButton, { flex: 1, backgroundColor: '#006699', margin: 5 }]}
            onPress={() => this.createVehicle( this.props.sku, 'is_new' ) }
          >
            <Text style={buttonStyles.activeSecondaryTextColor}>NEW</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[buttonStyles.activeSecondaryModalButton, { flex: 1, backgroundColor: '#66CC00', margin: 5 }]}
            onPress={() => this.createVehicle( this.props.sku, 'is_used' ) }
          >
            <Text style={buttonStyles.activeSecondaryTextColor}>USED</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[buttonStyles.activeSecondaryModalButton, { flex: 1, backgroundColor: '#E8F051', margin: 5 }]}
            onPress={() => this.createVehicle( this.props.sku, 'loaner' ) }
          >
            <Text style={buttonStyles.activeSecondaryTextColor}>LOANER</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[buttonStyles.activeSecondaryModalButton, { flex: 1, backgroundColor: '#8D8C88', margin: 5 }]}
            onPress={() => this.createVehicle( this.props.sku, 'wholesale_unit' ) }
          >
            <Text style={buttonStyles.activeSecondaryTextColor}>WHL UNIT</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  _renderAltActionView() { // either stallChange, info, or base
    // car features that can be displayed
    // spaceId, make, model, year, color, sku
    console.log('MODAL CONTENT TYPE: ', this.state.modalContent)
    if (this.state.modalContent == GlobalVariables.BASIC_MODAL_TYPE) {
      let vehicleColor = this.state.vehicles[this.state.arrayPosition].color ? this.state.vehicles[this.state.arrayPosition].color : '- -';
      const { model, mileage, age_in_days, key_board_location_id } = this.state.vehicles[this.state.arrayPosition]
      if (this.state.screen === 'keys') {
        return(
          <View style={[styles.tagModalMainBody, { borderLeftWidth: 0, borderRightWidth: 0}]}>
            <View style={{ padding: 10, paddingLeft: 14, paddingRight: 14}}>
              <Text style={styles.header}>SELECT A NEW LOCATION: </Text>
            </View>
            { this.state.key_board_locations.map((keylocation) => {
              return(
                <TouchableOpacity key={ keylocation.id} onPress={()=> this.updateVehicle({ key_board_location_name: keylocation.name })}>
                  <View style={[{ padding: 10, paddingLeft: 14, paddingRight: 14 }, keylocation.name === this.state.vehicle.key_board_location_name && {backgroundColor: '#727272'} ]}>
                    <Text style={styles.header}>{ keylocation.name }</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <View style={{ marginTop: 10, marginRight: 14 }}>
              <View style={pageStyles.rightButtonContainer}>
                <TouchableOpacity
                  style={buttonStyles.activeSecondaryModalButton}
                  onPress={() => this.setState({ screen: 'default' })}>
                  <Text style={buttonStyles.activeSecondaryTextColor}>
                    CANCEL
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )
      }
      return (
        <View
          style={styles.tagModalMainBody}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.header}>{ model }, {vehicleColor} </Text>
              <Text style={styles.header}>{ mileage } Miles, { age_in_days } Days</Text>
            </View>
            <View style={{ flex: 0 }}>
              <TouchableOpacity onPress={()=> this.launchPage('history') }>
                <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons type='ionicon' name={ 'ios-information-circle'} size={ 25 } style={{ color: '#FFF' }} /></View>
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={styles.tagButtonContainer}>

            <ButtonWithImageAndLabel
              text={'Test Drive'}
              source={require('../assets/images/car-white.png')}
              onPress={() => {this.launchPage('drive')}}
              active={ this.state.drive.event_id !== null && this.state.drive.event_id !== undefined } />

            <ButtonWithImageAndLabel
              text={'Fuel Vehicle'}
              source={require('../assets/images/fuel-white.png')}
              onPress={() => {this.launchPage('fuel')}}
              active={ this.state.fuel.event_id !== null && this.state.fuel.event_id !== undefined }/>

            {/*
            <ButtonWithImageAndLabel
              text={'Camera'}
              source={require('../assets/images/camera-white.png')}
              onPress={() => {this.launchPage('camera')}}/>
            */}

            <ButtonWithImageAndLabel
              text={'Note'}
              source={require('../assets/images/note-white.png')}
              onPress={() => {this.launchPage('note')}}/>
          </View>

          <View
            style={pageStyles.rightButtonContainer}>

            <TouchableOpacity
              style={[buttonStyles.activeSecondaryModalButton, { marginRight: 'auto' }]}
              onPress={() => this.setState({mileageOpen: !this.state.mileageOpen }) }>
              <Text style={buttonStyles.activeSecondaryTextColor}>
                ODO UPDATE
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={buttonStyles.activeSecondaryModalButton}
              onPress={() => {this.showChooseSpaceView()}}>
              <Text style={buttonStyles.activeSecondaryTextColor}>
                CHANGE STALL
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={buttonStyles.activePrimaryModalButton}
              onPress={this.confirmSpaceData}>
              <Text style={buttonStyles.activePrimaryTextColor}>
                CONFIRM
              </Text>
            </TouchableOpacity>
          </View>

            { this.state.mileageOpen &&
              <View>
                <TextInput
                  multiline={false}
                  style={[textStyles.greyBackgroundTextInput, textStyles.largeText, {textAlign: 'center'}]}
                  value={ `${ this.state.mileage }` }
                  keyboardType={'numeric'}
                  onChangeText={(mileage) => this.setState({ mileage: mileage }) }
                  autoFocus={true}
                />
                <View style={pageStyles.rightButtonContainer}>
                  <TouchableOpacity
                    style={buttonStyles.activeSecondaryModalButton}
                    onPress={() => { this.setState({ mileageOpen: false, mileage: Number(this.state.vehicle.mileage) })}}>
                    <Text style={buttonStyles.activeSecondaryTextColor}>
                      CANCEL
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={buttonStyles.activePrimaryModalButton}
                    onPress={()=> this.updateOdo( this.state.mileage ) }
                  >
                    <Text style={buttonStyles.activePrimaryTextColor}>
                      UPDATE ODOMETER
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            }
        </View>
      )

    } else if (this.state.modalContent == GlobalVariables.INFO_MODAL_TYPE) {
      return (
       <View
          style={styles.tagModalMainBody}>

          <Text style={styles.header}>
            {this.state.vehicles[this.state.arrayPosition].year} {this.state.vehicles[this.state.arrayPosition].make} {this.state.vehicles[this.state.arrayPosition].model}</Text>
          <View
            style={{visible: this.state.modalContent}}>

            <View
              style={[pageStyles.noteCard, {width: '100%', paddingTop: 20, borderRadius: 0}]}>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={textStyles.modalDataHeader}>
                  Mileage</Text>
                <Text style={textStyles.modalData}>
                  {this.state.vehicles[this.state.arrayPosition].mileage} miles</Text>
              </View>

              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={textStyles.modalDataHeader}>
                  Time in Stock</Text>
                <Text style={textStyles.modalData}>
                  {this.state.vehicles[this.state.arrayPosition].age_in_days} days</Text>
              </View>
            </View>
          </View>
        </View>
      )

    } else if (this.state.modalContent == GlobalVariables.STALL_ENTRY_MODAL_TYPE) {
      return (
        <View
          style={styles.tagModalMainBody}>

          <Text style={styles.header}>
            {this.props.year} {this.props.make} {this.props.model}</Text>
          <View
            style={{width: '100%', marginTop: 20, borderRadius: 0, paddingTop: 20}}>
            <Text style={[textStyles.modalDataHeader, {color: 'white'}]}>
              Stall Number</Text>
            <TextInput
              autoCapitalize='characters'
              multiline={false}
              style={[textStyles.greyBackgroundTextInput, textStyles.largeText, {textAlign: 'center'}]}
              placeholder={this.props.spaceId}
              placeholderTextColor='rgba(237, 235, 232, 0.5)'
              onChangeText={(stallNumber) => {this.newStallNumber = stallNumber}}
              onSubmitEditing={(event) => this.props.updateLotAndDismissModal(event.nativeEvent.text, this.state.vehicles[this.state.arrayPosition].vehicleId)}
              returnKeyType='send'
              autoFocus={true}/>
          </View>
        </View>
      )
    } else if (this.state.modalContent == GlobalVariables.EMPTY_MODAL_TYPE) {
      //TODO(adwoa): EMPTY_MODAL_TYPE add feedback here
      return (
        <View
          style={[styles.tagModalMainBody, {width: '100%', borderRadius: 0, paddingTop: 20}]}>
          <Text style={[textStyles.modalDataHeader, {color: 'white'}]}>
            Populate Empty Space</Text>
          <TextInput
            autoCapitalize='characters'
            multiline={false}
            style={[textStyles.greyBackgroundTextInput, textStyles.largeText, {textAlign: 'center'}]}
            placeholder='Stock Number'
            placeholderTextColor='rgba(237, 235, 232, 0.5)'
            onChangeText={(stockNumber) => {this.newStockNumber = stockNumber}}
            onSubmitEditing={(event) => this.props.updateLotAndDismissModal(this.props.spaceId, null, event.nativeEvent.text, 'Attempting to Populate Empty Space...')}
            returnKeyType='send'
            autoFocus={true}/>
        </View>
      )
    } else if ( this.state.modalContent === GlobalVariables.CREATE_MODAL_TYPE) {
      if (this.state.createView) {
        console.log('Vehicle Type: ', this.state.vehicleType)
        return(
          <View style={[styles.tagModalMainBody, {width: '100%', borderRadius: 0 }]}>
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#FFF', paddingBottom: 5 }}>
              <Text style={[styles.stallHeader, {textAlign: 'center', fontSize: 50, fontWeight: 'bold' }]}>{ this.props.sku }</Text>
            </View>
            { this.createVehicleButtons() }
          </View>
        )
      }
      return(
        <View style={[styles.tagModalMainBody, {width: '100%', borderRadius: 0, paddingTop: 20}]}>
           <View style={pageStyles.rightButtonContainer}>
            <TouchableOpacity
              style={buttonStyles.activeSecondaryModalButton}
              onPress={() => { this.tapOutsideModal() }}>
              <Text style={buttonStyles.activeSecondaryTextColor}>
                CLOSE
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={buttonStyles.activePrimaryModalButton}
              onPress={()=> this.setState({ createView: true }) }>
              <Text style={buttonStyles.activePrimaryTextColor}>
                CREATE VEHICLE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }
  }

  render() {
    let isBasicModal = this.state.modalContent === GlobalVariables.BASIC_MODAL_TYPE;
    let isCreateModal = this.state.modalContent === GlobalVariables.CREATE_MODAL_TYPE;
    console.log('Render modal content: ' , this.state.modalContent)
    let isOnMap = this.props.spaceId;
    console.log(this.state.vehicle)
    let vehicleUsageType = ''
    if (this.state.vehicle !== null) {
      let usageType = this.state.vehicle.usage_type !== null ? this.state.vehicle.usage_type : '';
      if (usageType === 'is_new') { vehicleUsageType = 'New'}
      if (usageType === 'is_used') { vehicleUsageType = 'Used'}
      if (usageType === 'loaner') { vehicleUsageType = 'Loaner'}
      if (usageType === 'wholesale_unit') { vehicleUsageType = 'Wholesale Unit'}
      if (usageType === 'lease_return') { vehicleUsageType = 'Lease Return'}
    }
    let vehicleYear = this.state.vehicle !== null && this.state.vehicle.year ? this.state.vehicle.year : '';
    let vehicleMake = this.state.vehicle !== null && this.state.vehicle.make ? this.state.vehicle.make : '';
    let modalTitle = isBasicModal ? isOnMap ? vehicleUsageType + ' ' + vehicleYear + ' ' + vehicleMake : 'Not in Stall' : ' ';
    if (this.state.vehicle!== null && this.state.vehicle.creation_source === 'user_created') {
      //console.log(this.state.vehicle)
      let usageType = this.state.vehicle.usage_type !== null ? this.state.vehicle.usage_type : '';
      modalTitle = ''
      if (usageType === 'is_new') { modalTitle = 'New'}
      if (usageType === 'is_used') { modalTitle = 'Used'}
      if (usageType === 'loaner') { modalTitle = 'Loaner'}
      if (usageType === 'wholesale_unit') {  modalTitle = 'Wholesale Unit'}
      if (usageType === 'lease_return') { modalTitle = 'Lease Return'}
    }

    if (this.state.loading) {
      return(
        <KeyboardAvoidingView
        style={styles.tagModalOverlay} behavior="padding" enabled keyboardVerticalOffset={Constants.statusBarHeight+40}>

        <TouchableWithoutFeedback
          onPress={() => {
            console.log('TOUCHING --OUTER-- VIEW');
            this.dismissModal();
          }}>
          <View
            style={styles.tagModalBlankSpace}>
          </View>
        </TouchableWithoutFeedback>

        <View style={styles.modalBottomContainer}>
          <View style={styles.tagModalStallBar}><Text style={styles.stallHeader}>LOADING...</Text></View>
          <View style={[styles.tagModalMainBody, { paddingTop: 30, paddingBottom: 30, alignItems: 'center', justifyContent: 'center' }]}>
          <ActivityIndicator size='large' color='#FFF' />
          </View>
        </View>
      </KeyboardAvoidingView>
      )
    }
    // In the case of showing a blank map with one highlight
    if (this.props.findingOnMap) {
      return(
        <KeyboardAvoidingView
        style={styles.tagModalOverlay} behavior="padding" enabled keyboardVerticalOffset={Constants.statusBarHeight+40}>

          <TouchableWithoutFeedback
            onPress={() => {
              this.props.findOnMap(false);
            }}>
            <View
              style={styles.tagModalBlankSpace}>
            </View>
          </TouchableWithoutFeedback>

          <View style={styles.modalBottomContainer}>
            <View style={styles.tagModalMainBody}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                  <Text style={[styles.stallHeader, { marginRight: 10 }]}>
                  {this.state.vehicle !== null && this.state.vehicle.stock_number ? this.state.vehicle.stock_number : '   - -'}</Text>
                  <Text style={styles.stallHeader}>{modalTitle}</Text>
                </View>
                <View style={{ flex: 0 }}>
                  <TouchableOpacity style={buttonStyles.activePrimaryModalButton} onPress={()=> this.props.findOnMap(false)}>
                    <Text style={buttonStyles.activePrimaryTextColor}>OKAY</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      )
    }
    return (
      <KeyboardAvoidingView
        style={styles.tagModalOverlay} behavior="padding" enabled keyboardVerticalOffset={Constants.statusBarHeight+40}>

        <TouchableWithoutFeedback
          onPress={() => {
            console.log('TOUCHING --OUTER-- VIEW');
            this.tapOutsideModal();
          }}>
          <View
            style={styles.tagModalBlankSpace}>
          </View>
        </TouchableWithoutFeedback>

        <View style={styles.modalBottomContainer}>
          { this.state.vehicle !== null && this.state.vehicles.length > 1 &&
            <View style={ styles.tagModalTabs }>
              { this.state.vehicles.map((vehicle, index) => {
                return(
                  <TouchableOpacity key={index} onPress={()=> {
                    this.props.setVehicleId(this.state.vehicles[index].id)
                    this.setState({arrayPosition: index, vehicle: this.state.vehicles[index] }) }
                  }><View style={[ styles.tagModalTab, index === this.state.arrayPosition &&  { backgroundColor: '#FFF' } ]}><Text style={[ index !== this.state.arrayPosition && {color: '#FFF' }]}>{ vehicle.stock_number}</Text></View></TouchableOpacity>
                );
              })}
            </View>
          }
          <View style={[styles.tagModalStallBar, { borderBottomWidth: 0, height: 'auto'}]}>
          { this.state.vehicle !== null &&
            <TouchableOpacity onPress={()=> {
              this.loadKeyBoardData();
              this.setState({screen: 'keys'})
            }}>
              <View style={{ marginLeft: -5, marginRight: -5, width: Dimensions.get('window').width, padding: 5, backgroundColor: '#727272'}}><Text style={[styles.stallHeader, { fontSize: 16}]}>{ this.state.vehicle.key_board_location_name !== null? `Key Location: ${ this.state.vehicle.key_board_location_name }` : 'Select Keyboard' }</Text></View>
            </TouchableOpacity>
          }
          </View>
          { isCreateModal ?
            <View style={[styles.tagModalStallBar, { borderTopWidth: 0, height: 'auto', paddingTop: 10, paddingBottom: 10}]}>
              <Text style={styles.stallHeader}> Vehicle not found: { this.props.sku }</Text>
            </View>
          :
            <View style={[styles.tagModalStallBar, { borderTopWidth: 0, height: 'auto', paddingTop: 10, paddingBottom: 10}]}>
              <Text style={styles.stallHeader}> {this.state.vehicle !== null && this.state.vehicle.stock_number ? this.state.vehicle.stock_number : '   - -'} </Text>
              <Text style={styles.stallHeader}>{modalTitle}</Text>
            </View>
          }

          {this._renderAltActionView()}

        </View>
      </KeyboardAvoidingView>

  	);
  }
}

class ButtonWithImageAndLabel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={this.props.onPress}
        style={{width: 80, height: 50,}}>
        <View style={{flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <Image
            source={this.props.source}
            style={buttonStyles.icon}
            resizeMode={"contain"}/>
          <Text style={[buttonStyles.label, {marginTop: 5}, this.props.active && { fontWeight: 'bold' }]}>{this.props.text}</Text>
        </View>
      </TouchableOpacity>
    )
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
    flexDirection: 'row'
  },
  tagModalTab: {
    padding: 10,
    backgroundColor: '#828282'
  }
});
