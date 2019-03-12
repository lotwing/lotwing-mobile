

export default {
  structureTagPayload: function(type, props, event_details) {
    // expects a valid type: tag, note, test_drive, fuel_vehicle, odometer_update
    let body = {
      'tag': {'vehicle_id': props.vehicleId, 'shape_id': props.spaceId}, 
      'event': {'event_type': type, 'event_details': event_details ? event_details : ''}
    }

    return body
  },

  registerTagAction: function(actionPayload) {
    let space_data = this.structureTagPayload(actionPayload);
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
        console.log(response);
        response.json();
      })
      .then((responseJson) => {
        console.log('\nTAG RESPONSE: ', responseJson, '\n');
      })
      .catch(err => {
        console.log('\nCAUHT ERROR: \n', err, err.name);
        return err
      });
  },

  backAction: function(navigation) {
    navigation.goBack();
  },

}
