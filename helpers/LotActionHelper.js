import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

export default {
  structureTagPayload: function(type, props, event_details) {
    // expects a valid type: tag, change_stall, note, test_drive, fuel_vehicle, odometer_update, photo_update, mark_sold, write_up
    let body = {
      'tag': {'vehicle_id': props.vehicleId, 'shape_id': props.spaceId}, 
      'event': {'event_type': type, 'event_details': event_details ? event_details : ''}
    }

    return body
  },

  registerTagAction: function(actionPayload) {
    console.log('TAG DATA: ', actionPayload);

    return fetch(GlobalVariables.BASE_ROUTE + Route.TAG_VEHICLE , {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+ GlobalVariables.LOTWING_ACCESS_TOKEN,
        },
        body: JSON.stringify(actionPayload),
      })
      .then((response) => {
        return response.json();
      })
      .then((responseJson) => {
        return true
      })
      .catch(err => {
        console.log('\nCAUHT ERROR: \n', err, err.name);
        return err
      });
  },

  endTimeboundTagAction: function(actionPayload, eventId) {
    console.log('END TAG DATA: ', actionPayload, eventId);

    return fetch(GlobalVariables.BASE_ROUTE + Route.COMPLETE_TIMED_TAG_EVENT + eventId, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+ GlobalVariables.LOTWING_ACCESS_TOKEN,
      },
      body: JSON.stringify(actionPayload),
    })
    .then((response) => {
      console.log('RETURNED FROM COMPLETE_TIMED_TAG_EVENT', response);
      // nothing returned from this action...
    })
    .catch(err => {
      console.log('\nCAUHT ERROR: \n', err, err.name);
      return err
    })
  },

  getEventId: function(spaceId) {
    console.log('GET EVENT ID: ', spaceId);

    return fetch(GlobalVariables.BASE_ROUTE + Route.VEHICLE_BY_SPACE + spaceId, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+ GlobalVariables.LOTWING_ACCESS_TOKEN,
      },
    })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      return response['events'][0]['data']['id']
    })
    .catch(err => {
      console.log('\nCAUHT ERROR: \n', err, err.name);
      return err
    })
  },

  backAction: function(navigation) {
    navigation.goBack();
  },

}
