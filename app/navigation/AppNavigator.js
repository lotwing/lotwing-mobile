import React from "react";
import { createSwitchNavigator, createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { createBottomTabNavigator } from "react-navigation-tabs";

import { Image, TouchableOpacity, Text, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Tabs from "./Tabs";

import LoginScreen from "../screens/LoginScreen";
import LotScreen from "../screens/LotScreen";
import MultiScreen from "../screens/MultiScreen";
import SalesScreen from "../screens/SalesScreen";
import VMScreen from "../screens/VMScreen";
import FuelScreen from "../screens/FuelScreen";
import DriveScreen from "../screens/DriveScreen";
import NoteScreen from "../screens/NoteScreen";
import HistoryScreen from "../screens/HistoryScreen";

import AuthLoadingScreen from "../screens/AuthLoadingScreen";

class NavigationMenu extends React.Component {
  render() {
    const { navigation } = this.props;
    return (
      <TouchableOpacity onPress={() => navigation.navigate("Sales")}>
        <Image
          source={require("../../assets/images/menu-wing.png")}
          style={{ width: 43, height: 25, marginLeft: 20 }}
        />
      </TouchableOpacity>
    );
  }
}

const navigationOptions = ({ navigation }) => {
  return {
    headerLeft: (
      <TouchableOpacity
        onPress={
          navigation.getParam("section") === "lot"
            ? navigation.getParam("onPress")
            : () =>
                navigation.navigate("Lot", {
                  extras: navigation.getParam("extras", {}),
                  showModal: true,
                  findingOnMap: false
                })
        }
      >
        <View
          style={{
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Ionicons
            type="ionicon"
            name={
              navigation.getParam("section") === "lot"
                ? "md-refresh"
                : "ios-arrow-back"
            }
            size={25}
            style={{ color: "#FFF" }}
          />
        </View>
      </TouchableOpacity>
    ),
    headerRight: (navigation.getParam("section") === "lot" ||
      navigation.getParam("section") === "multi") && (
      <TouchableOpacity
        onPress={() =>
          navigation.getParam("section") === "lot"
            ? navigation.navigate("Multi")
            : navigation.navigate("Lot", { refresh: true })
        }
      >
        <View
          style={{
            width: 80,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row"
          }}
        >
          <Ionicons
            type="ionicon"
            name={"ios-car"}
            size={navigation.getParam("section") === "lot" ? 18 : 25}
            style={{ color: "#FFF" }}
          />
          {navigation.getParam("section") === "lot" && (
            <Ionicons
              type="ionicon"
              name={"ios-car"}
              size={18}
              style={{ color: "#FFF", marginLeft: 5 }}
            />
          )}
        </View>
      </TouchableOpacity>
    )
  };
};

const LotStack = createStackNavigator(
  {
    Lot: {
      screen: LotScreen,
      navigationOptions: navigationOptions
    },
    Multi: {
      screen: MultiScreen,
      params: { resetValues: true },
      navigationOptions: navigationOptions
    },
    Fuel: {
      screen: FuelScreen,
      navigationOptions: navigationOptions
    },
    Drive: {
      screen: DriveScreen,
      navigationOptions: navigationOptions
    },
    Note: {
      screen: NoteScreen,
      navigationOptions: navigationOptions
    },
    History: {
      screen: HistoryScreen,
      navigationOptions: navigationOptions
    }
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      headerStyle: {
        backgroundColor: "#BE1E2D"
      },
      headerTitle: <NavigationMenu navigation={navigation} />,
      headerTintColor: "white"
    })
  }
);
const AuthStack = createStackNavigator({ Login: LoginScreen });

const AppTabs = createBottomTabNavigator(
  {
    LotStack: {
      screen: LotStack,
      params: { tabBarLabel: "Lot View" },
      navigationOptions: {
        tabBarVisible: false
      }
    },
    Sales: SalesScreen,
    VehicleManager: {
      screen: VMScreen,
      params: { tabBarLabel: "Vehicle Manager" }
    }
  },
  {
    //initialRouteName: 'Sales',
    defaultNavigationOptions: {
      tabBarComponent: props => <Tabs {...props} />
    }
  }
);

const switchNav = createSwitchNavigator(
  {
    App: AppTabs,
    Auth: AuthStack,
    AuthLoading: AuthLoadingScreen
  },
  {
    initialRouteName: "AuthLoading"
  }
);

const lotwingAppContainer = createAppContainer(switchNav);

export default lotwingAppContainer;
