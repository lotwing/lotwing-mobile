import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 10,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  darkBody: {
    backgroundColor: '#828282',
    alignItems: 'stretch',
    borderWidth: 14,
    borderColor: '#828282',
  },
  column: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  noteCard: {
    backgroundColor: 'white',
    borderColor: '#828282',
    borderWidth: 0.5,
    borderRadius: 5,
    width: '80%',
    // paddingTop: 20,
    paddingHorizontal: 10,
    minHeight: 100,
    // flex: 1,
  },
  rightButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
