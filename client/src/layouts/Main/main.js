import React from "react";
import PropTypes from "prop-types";
import { default as TopMenu } from "./TopMenu/topMenu";
import { default as TitleBar } from "./TitleBar/titleBar";

const Main = (props) => {
  const { children } = props;

  return (
    <div id="wrapper">
      <div className="d-flex flex-column" id="content-wrapper">
        <div id="content">
          <TitleBar />
          <TopMenu />
          {children}
        </div>
        <footer className="bg-white sticky-footer">
          <div className="container my-auto">
            <div className="text-center my-auto copyright">
              <span>Copyright © 2022</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

Main.propTypes = {
  children: PropTypes.node,
};

export default Main;
