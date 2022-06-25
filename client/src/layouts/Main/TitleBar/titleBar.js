import React from "react";
import { NavLink } from "react-router-dom";

const TitleBar = (props) => {
  return (
    <nav className="navbar navbar-light navbar-expand bg-white topbar static-top">
      <div className="container">
        <NavLink
          className="navbar-brand d-flex justify-content-center align-items-center topbar-brand m-0"
          activeClassName="active"
          to="/"
        >
          <div className="topbar-brand-text mx-4">
            <span>ChartBook</span>
          </div>
        </NavLink>
      </div>
    </nav>
  );
};

export default TitleBar;
