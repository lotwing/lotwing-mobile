import {StyleSheet} from 'react-native';

export default pageStyles = StyleSheet.create({
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
  }
});