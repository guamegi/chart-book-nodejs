import React from "react";
import { NavLink } from "react-router-dom";

class TopMenu extends React.Component {
  render() {
    return (
      <nav
        className={
          "navbar navbar-dark navbar-expand bg-gradient-primary shadow mb-4"
        }
      >
        <div className="container d-flex flex-row">
          <ul className="nav navbar-nav text-light">
            <li className="nav-item ml-3" role="presentation">
              <NavLink
                className="nav-link"
                activeClassName="active"
                to="/portfolio"
              >
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
    );
  }
}

export default TopMenu;
