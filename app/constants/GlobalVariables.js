
export default {
	// FUNDAMENTAL DATA

	BASE_ROUTE: 'https://app.lotwing.com',
	LOTWING_ACCESS_TOKEN: '',
	USER_NAME: '',
	SUCCESSFUL_LOGIN: 'Login Successful',
	LOT_DATA: [],
	MAPBOX_ACCESSTOKEN: 'pk.eyJ1IjoiYWxleG5laWdoZXIiLCJhIjoiY2psZ3I1bTllMDF5ZjNwdDUydjQzMWJ1cCJ9.nG0jV5mQE65ySlh66w5faQ',
	EMPTY_GEOJSON: {"id":"empty_geojson","type":"Feature","properties":{},"geometry":{"coordinates":[[[0,0]]],"type":"Point"}},

	// TAG MODAL ACTION VIEWS

	BASIC_MODAL_TYPE: 'base',
	EMPTY_MODAL_TYPE: 'empty',
	CHOOSE_EMPTY_SPACE: 'click_to_populate',
	INFO_MODAL_TYPE: 'info',
	STALL_ENTRY_MODAL_TYPE: 'stall_change',
	ACTION_FEEDBACK_MODAL_TYPE: 'action_feedback',
	CREATE_MODAL_TYPE: 'create_vehicle',

	// VEHICLE ACTIONS

	BEGIN_FUELING: 'fuel_vehicle',
	BEGIN_DRIVE: 'test_drive',
	ODO_UPDATE: 'odometer_update',
};