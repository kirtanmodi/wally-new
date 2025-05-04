import { Redirect } from "expo-router";
import React from "react";

const home = () => {
  return <Redirect href="/(tabs)" />;
};

export default home;
