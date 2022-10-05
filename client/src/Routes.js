import React from "react";
import { Switch, Redirect } from "react-router-dom";
import { ProtectedRouteWithLayout } from "./components";
import Layout from "./layouts";
import { Home, Market, NotFound } from "./pages";

const Routes = () => {
  return (
    <Switch>
      <ProtectedRouteWithLayout
        component={Home}
        exact
        layout={Layout}
        path="/"
      />
      <ProtectedRouteWithLayout
        component={Market}
        exact
        layout={Layout}
        path="/market"
      />
      <ProtectedRouteWithLayout
        component={NotFound}
        exact
        layout={Layout}
        path="/not-found"
      />
      <Redirect to="/not-found" />
    </Switch>
  );
};

export default Routes;
