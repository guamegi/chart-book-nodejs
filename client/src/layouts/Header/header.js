import React from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
  return (
    <header>
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
      <nav
        className={
          "navbar navbar-dark navbar-expand bg-gradient-primary shadow mb-4"
        }
      >
        <div className="container d-flex flex-row">
          <ul className="nav navbar-nav text-light">
            <li className="nav-item ml-3" role="presentation">
              <NavLink className="nav-link" activeClassName="active" to="/">
                <span>자산현황</span>
              </NavLink>
            </li>
            <li className="nav-item ml-3" role="presentation">
              <NavLink
                className="nav-link"
                activeClassName="active"
                to="/market"
              >
                <span>증시현황</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
