/* eslint-disable */
import React, { useEffect, useRef, useState } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";
import { Carousel } from "@trendyol-js/react-carousel";

import { addIndexData, addCardData } from "config/crawler";
import { ChartCard } from "../../components";
import styles from "./market.module.css";

let chart = null;
const Home = () => {
  const tvChartRef = useRef(); // trading view chart selector

  let kospiData = [];
  const [cardInfo, setCardInfo] = useState([
    { name: "다우존스", shortName: "DJI", code: "DJI", price: "price" },
    {
      name: "나스닥 종합",
      shortName: "NAS",
      code: "IXIC",
      price: "price",
    },
    {
      name: "S&P 500",
      shortName: "SPI",
      code: "SPX",
      price: "price",
    },
    {
      name: "영국 FTSE 100",
      shortName: "LNS",
      code: "FTSE100",
      price: "price",
    },
    {
      name: "프랑스 CAC 40",
      shortName: "PAS",
      code: "CAC40",
      price: "price",
    },
    {
      name: "독일 DAX",
      shortName: "XTR",
      code: "DAX30",
      price: "price",
    },
  ]);

  const [chartName, setChartName] = useState(["KOSPI"]);
  const [ohlcPrice, setOhlcPrice] = useState({
    openPrice: "",
    highPrice: "",
    lowPrice: "",
    closePrice: "",
  });

  const { openPrice, highPrice, lowPrice, closePrice } = ohlcPrice;
  const [chartInterval, setChartInterval] = useState(["Day"]);

  useEffect(() => {
    const data = addIndexData();
    kospiData.push(data);
    makeChart();
    updateCardPrice();
  }, []);

  const updateCardPrice = () => {
    addCardData().then((data) => {
      // console.log(data);
      const [DJI, NAS, SPI, LNS, PAS, XTR] = data;

      let newCardInfo = cardInfo.map((item) => {
        item.price = eval(item.shortName).closePrice;
        return item;
      });

      setCardInfo(newCardInfo);
    });
  };

  // tradingView 차트 생성
  const makeChart = () => {
    if (chart) {
      chart.remove();
      chart = null;
    }

    chart = createChart(tvChartRef.current, {
      width: tvChartRef.current.offsetWidth,
      height: 500,
      layout: {
        // background: "#ffffff",
      },
      options: {
        responsive: true,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      // priceScale: {
      //   position: "right",
      // },
      rightPriceScale: {
        scaleMargins: {
          top: 0.1,
          bottom: 0.25,
        },
        borderVisible: true,
      },
      watermark: {
        visible: true,
        fontSize: 34,
        horzAlign: "center",
        vertAlign: "center",
        color: "rgba(171, 71, 188, 0.1)",
        text: "Simple ChartBook",
      },
    });

    // Make Chart Responsive with screen resize
    new ResizeObserver((entries) => {
      if (entries.length === 0 || entries[0].target !== tvChartRef.current) {
        return;
      }
      const newRect = entries[0].contentRect;
      chart.applyOptions({ height: newRect.height, width: newRect.width });
    }).observe(tvChartRef.current);

    // kospi data Promise 분해 할당
    // [['날짜', '시가', '고가', '저가', '종가', '거래량', '외국인소진율'],
    // ["20200811", 2396.11, 2429.36, 2396.11, 2418.67, 843437, 0.0],...]
    kospiData[0].then((datas) => {
      // 캔들 데이터 저장
      let candleArr = datas.map((data) => {
        // console.log(data);
        let tempData = {
          time: "",
          open: "",
          high: "",
          low: "",
          close: "",
        };
        // 날짜 string 변환
        const date = data[0];
        const year = date.slice(0, 4);
        const month = date.slice(4, 6);
        const day = date.slice(date.length - 2, date.length);

        tempData.time = `${year}-${month}-${day}`;
        tempData.open = data[1];
        tempData.high = data[2];
        tempData.low = data[3];
        tempData.close = data[4];

        return tempData;
      });

      // 거래량 데이터 저장
      let histArr = datas.map((data) => {
        let tempData = {
          time: "",
          value: "",
        };
        // 날짜 string 변환
        const date = data[0];
        const year = date.slice(0, 4);
        const month = date.slice(4, 6);
        const day = date.slice(date.length - 2, date.length);

        tempData.time = `${year}-${month}-${day}`;
        tempData.value = data[5];

        return tempData;
      });

      // 캔들 데이터 차트 셋팅
      candleArr.shift();
      let candleSeries = chart.addCandlestickSeries({
        upColor: "red",
        downColor: "blue",
        borderVisible: false,
        wickUpColor: "red",
        wickDownColor: "blue",
      });
      candleSeries.setData(candleArr);

      // 거래량 데이터 차트 셋팅
      histArr.shift();
      let histSeries = chart.addHistogramSeries({
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "",
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
      histSeries.setData(histArr);

      const lastValue = datas[datas.length - 1];
      // console.log(datas, kospiData, lastValue);
      // 종목,시,고,저,종가
      setOhlcPrice({
        ...ohlcPrice,
        openPrice: lastValue[1],
        highPrice: lastValue[2],
        lowPrice: lastValue[3],
        closePrice: lastValue[4],
      });
    });
  };

  useEffect(() => {
    // console.log(chartInterval, chartName);
    const data = addIndexData(chartName[0], chartInterval[0].toLowerCase());
    kospiData = [];
    kospiData.push(data);

    makeChart();
  }, [chartInterval]);

  // symbol (코스피, 코스닥, 선물) / interval 클릭
  const onClickList = (symbol, interval = "Day") => {
    // console.log(symbol, interval);
    if (symbol) {
      setChartName([symbol]);
    }

    setChartInterval([interval]);
  };

  const RightArrow = () => {
    return (
      <button className={styles.arrow}>
        <i className="fas fa-angle-right text-gray-300 fa-2x ml-2"></i>
      </button>
    );
  };
  const LeftArrow = () => {
    return (
      <button className={styles.arrow}>
        <i className="fas fa-angle-left text-gray-300 fa-2x"></i>
      </button>
    );
  };

  return (
    <div className="container mb-4">
      <div className="col">
        <Carousel
          show={2.5}
          slide={2}
          transition={0.9}
          swiping={true}
          rightArrow={<RightArrow />}
          leftArrow={<LeftArrow />}
          className="mb-5"
          dynamic={true}
        >
          {cardInfo.map((item, index) => {
            return <ChartCard key={index} item={item} />;
          })}
        </Carousel>

        <div className="col">
          <nav className={"navbar navbar-expand"}>
            <div className="container d-flex flex-row">
              <ul className="nav navbar-nav text-dark">
                <li
                  className={`mr-2`}
                  role="button"
                  onClick={() => {
                    onClickList("KOSPI");
                  }}
                >
                  <span className="text-muted">코스피</span>
                </li>
                <span className="text-muted">|</span>
                <li
                  className={`ml-2 mr-2`}
                  role="button"
                  onClick={() => {
                    onClickList("KOSDAQ");
                  }}
                >
                  <span className="text-muted">코스닥</span>
                </li>
                <span className="text-muted">|</span>
                <li
                  className={`ml-2`}
                  role="button"
                  onClick={() => {
                    onClickList("FUT");
                  }}
                >
                  <span className="text-muted">선물</span>
                </li>
              </ul>
              <ul className="nav navbar-nav text-dark">
                <li className="p-2">
                  <span className="text-muted">Interval:</span>
                </li>
                <li className="nav-item dropdown">
                  <div
                    className="nav-link dropdown-toggle text-muted"
                    id="navbarDropdown"
                    role="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    {chartInterval}
                  </div>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="navbarDropdown"
                  >
                    <div
                      className="dropdown-item"
                      role="button"
                      onClick={() => {
                        onClickList(null, "Day");
                      }}
                    >
                      Day
                    </div>
                    <div
                      className="dropdown-item"
                      role="button"
                      onClick={() => {
                        onClickList(null, "Week");
                      }}
                    >
                      Week
                    </div>
                    <div
                      className="dropdown-item"
                      role="button"
                      onClick={() => {
                        onClickList(null, "Month");
                      }}
                    >
                      Month
                    </div>
                    <div className="dropdown-divider"></div>
                    <div
                      className="dropdown-item"
                      role="button"
                      onClick={() => {
                        onClickList(null, "Day");
                      }}
                    >
                      Day
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </nav>
          <div className="card shadow py-2">
            <div className="card-body">
              <div className="row mb-2">
                <div className="text-primary font-weight-bold ml-3">
                  {chartName}
                </div>
                <div className="text-dark font-weight-bold ml-3">
                  {closePrice}
                </div>
                <div className="ml-4">
                  <label className="small ml-2">시</label>
                  <span className="small font-weight-bold ml-1">
                    {openPrice}
                  </span>
                  <label className="small ml-2">고</label>
                  <span className="small font-weight-bold ml-1">
                    {highPrice}
                  </span>
                  <label className="small ml-2">저</label>
                  <span className="small font-weight-bold ml-1">
                    {lowPrice}
                  </span>
                </div>
              </div>
              <div id="tvChart" ref={tvChartRef}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
