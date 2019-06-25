export default {
	// GET REQUESTS
	// - - - - - - - - - - - - - - - -
	FULL_LOT: '/api/shapes',
	EVENTS: '/api/events',
	VEHICLE_BY_SPACE: '/api/shapes/',
	PARKING_LOT: '/api/shapes/parking_lots',
	PARKING_SPACE_METADATA: '/api/shapes/parking_spaces',

	LOGIN: '/api/auth/login',
	AUTH_CHECK: '/api/auth/test',
	VEHICLE: '/api/vehicle/',
	VEHICLE_BY_SKU: '/api/vehicles/stock_numbers/',

	// POST REQUESTS
	// - - - - - - - - - - - - - - - -
	// This endpoint expects the following parameters
	// * vehicle_id (which vehicle is this)
	// * shape_id (which parking space is this)
	// * event_type (is it a "tag", "note", "test drive", etc)
	// * event_details (for notes/test drives/etc, leave a comment here)
	TAG_VEHICLE: '/api/tags/',

	// PUT REQUEST
	// - - - - - - - - - - - - - - - -
	COMPLETE_TIMED_TAG_EVENT: '/api/events/' // add event id to the end of this
	// Body {
	// 	acknowledged: true/false
	// 	event_details: "" }
}
