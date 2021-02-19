import React from "react";
import {View, Text} from "react-native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/FontAwesome5"
import HomeNavigator from "./HomeNavigator";

const Tabs = createBottomTabNavigator();

const TabsNavigator = () => {
  return (
    <Tabs.Navigator
      initialRouteName="Home"
      tabBarOptions={{
        keyboardHidesTabBar: true,
        showLabel: true,
        // activeTintColor: "#e91e63"
        activeTintColor: "#03bafc"
      }}
    >
      <Tabs.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({color}) => {
            return (
              <Icon
                name="home"
                style={{position: "relative"}}
                color={color}
                size={30}
              />
            )
          }
        }}
      />
      <Tabs.Screen
        name="Cart"
        component={() => <Text>Cart screen</Text>}
        options={{
          tabBarIcon: ({color}) => {
            return (
              <Icon
                name="shopping-cart"
                color={color}
                size={30}
              />
            )
          }
        }}
      />
      <Tabs.Screen
        name="Admin"
        component={() => <Text>Admin panel screen</Text>}
        options={{
          tabBarIcon: ({color}) => {
            return (
              <Icon
                name="cog"
                color={color}
                size={30}
              />
            )
          }
        }}
      />
      <Tabs.Screen
        name="User"
        component={() => <Text>User panel screen</Text>}
        options={{
          tabBarIcon: ({color}) => {
            return (
              <Icon
                name="user"
                color={color}
                size={30}
              />
            )
          }
        }}
      />
    </Tabs.Navigator>
  );
}

export default TabsNavigator;