import React from "react";

const NotFound = (props) => {
  return (
    <div className="container">
      <div className="col text-center mt-5 mb-5">
        <h3 className="text-dark text-center mb-4">Page not found</h3>
        <img
          src={`${process.env.PUBLIC_URL}/not_found.png`}
          alt="page not found"
        />
      </div>
    </div>
  );
};

export default NotFound;
