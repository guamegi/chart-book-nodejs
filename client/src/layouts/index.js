import React from "react";
import PropTypes from "prop-types";
import Header from "./Header/header";
import Footer from "./Footer/footer";

const Layout = (props) => {
  const { children } = props;

  return (
    <div id="wrapper">
      <div className="d-flex flex-column" id="content-wrapper">
        <Header />
        <div id="content">{children}</div>
        <Footer />
      </div>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node,
};

export default Layout;
