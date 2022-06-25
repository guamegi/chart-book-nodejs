import React from "react";
import { Route } from "react-router-dom";
import PropTypes from "prop-types";

const ProtectedRouteWithLayout = (props) => {
  const { layout: Layout, component: Component, ...rest } = props;

  return (
    <Route
      {...rest}
      render={(matchProps) => (
        <Layout>
          <Component {...matchProps} />
        </Layout>
      )}
    />
  );
};

ProtectedRouteWithLayout.propTypes = {
  component: PropTypes.any.isRequired,
  layout: PropTypes.any.isRequired,
  path: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
};

export default ProtectedRouteWithLayout;
