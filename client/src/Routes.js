import React from "react";
import { Switch, Redirect } from "react-router-dom";
import { ProtectedRouteWithLayout } from "./components";
import { AdminLayout } from "./layouts";
import { Market, Portfolio, NotFound } from "./pages";

const Routes = () => {
  return (
    <Switch>
      <Redirect exact from="/" to="/portfolio" />
      <ProtectedRouteWithLayout
        component={Portfolio}
        exact
        layout={AdminLayout}
        path="/portfolio"
      />
      <ProtectedRouteWithLayout
        component={Market}
        exact
        layout={AdminLayout}
        path="/market"
      />
      <ProtectedRouteWithLayout
        component={NotFound}
        exact
        layout={AdminLayout}
        path="/not-found"
      />
      <Redirect to="/not-found" />
    </Switch>
  );
};

export default Routes;
