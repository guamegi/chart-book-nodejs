import React from "react";
import styles from "./chartCard.module.css";

const ChartCard = ({ item }) => {
  // console.log("item:", item);
  return (
    <div className="ml-2 mr-2">
      <div className="card">
        <div className="card-body">
          <div className="col d-flex flex-column justify-content-between">
            <div className="row ml-1 mb-2">
              <div className="text-uppercase text-primary font-weight-bold mb-0">
                {item.name}
              </div>
              <div className="text-dark font-weight-bold ml-4 mb-0">
                {/* <span ref={(el) => (cardInfoRef.current[item.name] = el)}> */}
                <span>{item.price}</span>
              </div>
            </div>
            <div className={styles.cardChart}>
              <img
                className={styles.cardImg}
                src={`https://ssl.pstatic.net/imgfinance/chart/world/continent/${item.shortName}@${item.code}.png`}
                alt="index chart"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;
