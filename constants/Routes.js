export default {
	// GET REQUESTS 
	// - - - - - - - - - - - - - - - - 
	FULL_LOT: '/api/shapes',
	VEHICLE_BY_SPACE: '/api/shapes/',
	PARKING_LOT: '/api/shapes/parking_lots',
	PARKING_SPACE_METADATA: '/api/shapes/parking_spaces',
	
	LOGIN: '/api/auth/login',
	VEHICLE: '/api/vehicle/',

	// POST REQUESTS
	// - - - - - - - - - - - - - - - - 
	// This endpoint expects the following parameters
	// * vehicle_id (which vehicle is this)
	// * shape_id (which parking space is this)
	// * event_type (is it a "tag", "note", "test drive", etc)
	// * event_details (for notes/test drives/etc, leave a comment here)
	TAG_VEHICLE: 'api/tags/',

	
}