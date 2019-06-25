import GlobalVariables from '../constants/GlobalVariables';
import Route from '../constants/Routes';

export default {
  /*
   * Tag Actions
   */
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
        return responseJson
      })
      .catch(err => {
        console.log('\nCAUGHT ERROR IN REGISTER PAYLOAD: \n', err, err.name);
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
      console.log('\nCAUGHT ERROR IN END TIMEBOUND TAG ACTION: \n', err, err.name);
      return err
    })
  },

  getEventId: function(spaceId, eventType) {
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
      //console.log('GET EVENT ID RESPONSE:' , response.events[0])
      const targetEvents = response.events[0].filter(event => event.data.attributes.event_type === eventType)
      console.log('TARGET EVENTS: ', targetEvents)
      let finalResponse = [];
      targetEvents.forEach((event )=> {
        finalResponse.push(event.data.id)
      })
      return finalResponse
    })
    .catch(err => {
      console.log('\nCAUGHT ERROR IN GET EVENT ID: \n', err, err.name);
      return err
    })
  },

  /*
   * Navigation Action
   */
  backAction: function(navigation) {
    navigation.goBack();
  },

  /*
   * Mapbox Shape Formation Actions
   */
  createPolygonsFromObject: function(polygonObject) {
    return Object.keys(polygonObject)
        .map((ps_id) => this._createNewPolygon(polygonObject[ps_id]["geo_info"]["geometry"]["coordinates"], ps_id));
  },

  _createNewPolygon: function(coordinates, id) {
    let empty_polygon_geojson = {
      "id": id,
      "type": "Feature",
      "geometry": {
          "type": "Polygon",
          "coordinates": coordinates
        }
    };
    return empty_polygon_geojson
  },

  createFeatureCollection: function(list_of_features) {
    return ({
      "type": "FeatureCollection",
      "features": list_of_features
    })
  },

}
