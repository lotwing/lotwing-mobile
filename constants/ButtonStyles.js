import {StyleSheet} from 'react-native';

export default buttonStyles = StyleSheet.create({
  activePrimaryModalButton: {
    padding: 10,
    marginLeft: 10,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  activeSecondaryModalButton: {
    padding: 10,
    borderRadius: 5,
    borderColor: 'white',
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: '#828282',
  },
  activePrimaryTextColor: {
    fontSize: 11,
    color: '#828282',
  },
  activeSecondaryTextColor: {
    fontSize: 11,
    color: '#FFFFFF',
  }
});
