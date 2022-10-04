import React, { useState, useEffect, useRef } from "react";
import NumberFormat from "react-number-format";

import { SearchStockPopup } from "components";
import {
  ws,
  removeWebSocket,
  removeAllWebSocket,
  initWebSocket,
} from "services/websocket";
import { addStockData } from "services/crawler";
import { initLineChart, removeLineChart, setLineChart } from "chart/area";
import {
  initDoughnutChart,
  removeDoughnutChart,
  setDoughnutChart,
} from "chart/doughnut";
import { checkMobile, comma, uncomma } from "common";
import styles from "./portfolio.module.css";
import useStore from "../../store/store";

let stockInterval = {};
const Portfolio = () => {
  const [stockData, setStockData] = useState([]);
  const [modalOn, setModalOn] = useState(false);
  const addButtonEl = useRef();
  const stockPopupEl = useRef();
  const isMobile = checkMobile();

  const stockUpdateTime = 10000;
  const defaultData = {
    0: {
      amount: "0.1",
      avgPrice: "20,000,000",
      category: "coin",
      code: "BTC",
      codes: "KRW-BTC",
      en_name: "Bitcoin",
      name: "비트코인",
    },
    1: {
      amount: "10",
      avgPrice: "50,000",
      category: "stock",
      code: "005930",
      codes: null,
      en_name: null,
      name: "삼성전자",
    },
  };

  const { totalAmt, totalEval, totalProfit, totalProfitRate } = useStore();
  const cardSectionInfo = [
    ["primary", "총 매수", "totalAmt", totalAmt],
    ["success", "총 평가", "totalEval", totalEval],
    ["info", "평가손익", "totalProfit", totalProfit],
    ["warning", "수익률", "totalProfitRate", totalProfitRate],
  ];
  const chartSectionInfo = [
    ["7", "자산 흐름", "myAreaChart"],
    ["5", "보유 비중", "myDoughnutChart"],
  ];

  useEffect(() => {
    if (ws.length > 0) {
      // console.log("ws:", ws);
      removeAllWebSocket();
    }
    loadData();
    setLineChart();
    setDoughnutChart();
    initLineChart();
    initDoughnutChart();

    document.addEventListener("click", closeModal);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("click", closeModal);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      /**
       * myLineChart, myDoughnutChart 제거
       * 페이지 내 이동 없을때는 myLineChart 그대로 유지, 새로 페이지 렌더링 될때는 myLineChart
       * 제거하고 새로 생성해야 함.
       */
      removeLineChart();
      removeDoughnutChart();
    };

    // dependency warning 무시
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    // localData 체크
    const localDataStr = localStorage.getItem("saveData");
    let data = null;
    console.log("load data");

    if (localDataStr) {
      console.log("saved");
      data = JSON.parse(localDataStr);
    } else {
      console.log("not saved");
      // default data
      data = { ...defaultData };
    }

    let dataArr = [];
    for (let i in data) {
      dataArr.push(data[i]);
    }
    // console.log("dataArr:", dataArr);
    await setStockData(dataArr); // table 추가

    // 실시간
    for (let data of dataArr) {
      if (data.category === "stock") {
        clearInterval(stockInterval[data.code]);
        stockInterval[data.code] = null;

        // 평단,수량 입력
        document.querySelector(`#A${data.code}-avgPrice`).value = data.avgPrice;
        document.querySelector(`#A${data.code}-amount`).value = data.amount;

        // addStockData(data.code);
        const stockData = await addStockData(data.code).then(
          (html) => html.data.datas[0]
        );
        updateStockData(stockData);

        // stock data 반복 호출
        stockInterval[data.code] = setInterval(async function () {
          const stockData = await addStockData(data.code).then(
            (html) => html.data.datas[0]
          );
          updateStockData(stockData);
        }, stockUpdateTime);
      } else {
        document.querySelector(`#${data.code}-avgPrice`).value = data.avgPrice;
        document.querySelector(`#${data.code}-amount`).value = data.amount;

        initWebSocket(data.code, data.codes);
      }
    }
  }

  const saveData = () => {
    // console.log(stockData);
    // localstorage 저장. 종목 정보 + 평단/수량
    const data = { ...stockData };
    for (let i in data) {
      // console.log(data[i]);
      let avgPriceInput = null;
      let amountInput = null;
      if (data[i].category === "stock") {
        avgPriceInput = document.querySelector(`#A${data[i].code}-avgPrice`);
        amountInput = document.querySelector(`#A${data[i].code}-amount`);
      } else {
        avgPriceInput = document.querySelector(`#${data[i].code}-avgPrice`);
        amountInput = document.querySelector(`#${data[i].code}-amount`);
      }
      // data에 인덱스 기준으로 평단,수량 저장
      data[i].avgPrice = avgPriceInput.value;
      data[i].amount = amountInput.value;
    }
    console.log("data:", data);
    localStorage.setItem("saveData", JSON.stringify(data));

    // 저장 성공 팝업
    alert("종목 저장 성공!");
  };

  // add new 클릭. 모달 창 열기
  const openModal = () => {
    setModalOn(!modalOn);
  };

  // background 클릭. 모달 창 닫기
  const closeModal = (event) => {
    const target = event.target;
    if (target === addButtonEl.current || target === stockPopupEl.current)
      return;
    setModalOn(false);
  };

  // 개별 종목 삭제
  const removeStock = (code, index) => {
    console.log("remove");
    // console.log(code, index);
    setStockData(stockData.filter((stock) => stock.code !== code));
    if (ws.length > 0) {
      // 웹소켓 삭제
      removeWebSocket(index);
    }
  };

  // remove all 클릭. 전체 종목 삭제
  const removeAllStock = () => {
    console.log("remove all");
    setStockData([]);
    if (ws.length > 0) {
      // 웹소켓 전체 삭제
      removeAllWebSocket();
    }
  };

  // 실시간 on
  const getData = () => {
    if (ws.length > 0) {
      removeAllWebSocket(); // crypto
      for (let i in stockInterval) {
        clearInterval(stockInterval[i]); // stock
        stockInterval[i] = null;
      }
    }
    console.log("get data");
    // console.log(stockInterval);

    stockData.forEach(async (stock) => {
      if (stock.category === "coin") {
        initWebSocket(stock.code, stock.codes);
      } else if (stock.category === "stock") {
        stockInterval[stock.code] = setInterval(async function () {
          const stockData = await addStockData(stock.code).then(
            (html) => html.data.datas[0]
          );
          updateStockData(stockData);
        }, stockUpdateTime);
      }
    });
    // console.log("ws:", ws);
  };

  // 실시간 off
  const stopData = () => {
    console.log("stop data");
    // console.log(stockInterval);

    if (ws.length > 0) {
      removeAllWebSocket();
      for (let i in stockInterval) {
        clearInterval(stockInterval[i]);
        stockInterval[stockInterval[i]] = null;
      }
    }
  };

  // 탭 변환시
  const handleVisibilityChange = () => {
    console.log("is hidden:", document.hidden);
    // console.log(ws);

    // 현재 페이지 활성화시 소켓 연결
    if (!document.hidden) {
      stockData.forEach((stock) => {
        if (stock.category === "coin") {
          initWebSocket(stock.code, stock.codes);
        }
      });
    }
  };

  const { setTotalAmt, setTotalEval, setTotalProfit, setTotalProfitRate } =
    useStore();
  // 주식 데이터 update
  const updateStockData = (data) => {
    if (!data) return;

    // console.log(data);
    const priceData = data.closePrice;
    const cr_txt = data.fluctuationsRatio; // change rate
    const cp_txt = data.compareToPreviousClosePrice; // change price
    const riseFallData = data.compareToPreviousPrice.text;

    const totalAmtEl = document.querySelector("#totalAmt"); // 총 매수
    // const totalEvalEl = document.querySelector("#totalEval"); // 총 평가
    const totalProfitEl = document.querySelector("#totalProfit"); // 평가손익
    // const totalProfitRateEl = document.querySelector("#totalProfitRate"); // 수익률

    const priceEl = document.querySelector(`#A${data.itemCode}-price`);
    const changeRateEl = document.querySelector(
      `#A${data.itemCode}-changeRate`
    );
    const changePriceEl = document.querySelector(
      `#A${data.itemCode}-changePrice`
    );

    const avgPriceInputEl = document.querySelector(
      `#A${data.itemCode}-avgPrice`
    );
    const amountInputEl = document.querySelector(`#A${data.itemCode}-amount`);

    const evalPriceEl = document.querySelector(`#A${data.itemCode}-eval`);
    const profitEl = document.querySelector(`#A${data.itemCode}-profit`);
    const profitRateEl = document.querySelector(`#A${data.itemCode}-yield`);

    if (priceEl) {
      priceEl.textContent = priceData;
      // input 두개에 값이 있으면, 평가금액/평가손익/수익률 갱신하기
      if (avgPriceInputEl.value && amountInputEl.value) {
        //   console.log(avgPriceInput.value, amountInput.value);
        evalPriceEl.textContent = comma(
          (uncomma(priceData) * uncomma(amountInputEl.value)).toFixed(0)
        );
        profitEl.textContent = comma(
          (
            uncomma(priceData) * uncomma(amountInputEl.value) -
            uncomma(avgPriceInputEl.value) * uncomma(amountInputEl.value)
          ).toFixed(0)
        );
        profitRateEl.textContent =
          (
            (uncomma(priceData) / uncomma(avgPriceInputEl.value)) * 100 -
            100
          ).toFixed(2) + "%";

        // total amt 계산
        const allAvgPriceEl = document.querySelectorAll(".avgPrice");
        const allAmountEl = document.querySelectorAll(".amount");
        let avgPriceNum = [];
        let amountNum = [];
        let amtNum = 0;
        allAvgPriceEl.forEach((e) => {
          avgPriceNum.push(uncomma(e.value));
        });
        allAmountEl.forEach((e) => {
          amountNum.push(uncomma(e.value));
        });
        for (let i = 0; i < avgPriceNum.length; i++) {
          amtNum += avgPriceNum[i] * amountNum[i];
        }
        // totalAmtEl.textContent = comma(amtNum.toFixed(0));
        const totalData = comma(amtNum.toFixed(0));
        setTotalAmt(totalData);

        // total eval 계산
        const allEvalEl = document.querySelectorAll(".eval");
        let allEvalNum = 0;
        allEvalEl.forEach(function (e) {
          if (e.innerText) allEvalNum += parseFloat(uncomma(e.innerText));
        });
        // totalEvalEl.textContent = comma(allEvalNum.toFixed(0));
        const evalData = comma(allEvalNum.toFixed(0));
        setTotalEval(evalData);

        // total profit 계산
        const allProfitEl = document.querySelectorAll(".profit");
        let allProfitNum = 0;
        allProfitEl.forEach((e) => {
          if (e.innerText) allProfitNum += parseFloat(uncomma(e.innerText));
        });
        // totalProfitEl.textContent = comma(allProfitNum.toFixed(0));
        const profitData = comma(allProfitNum.toFixed(0));
        setTotalProfit(profitData);

        // total 수익률 계산
        // totalProfitRateEl.textContent =
        //   (
        //     (uncomma(totalProfitEl.textContent) /
        //       uncomma(totalAmtEl.textContent)) *
        //     100
        //   ).toFixed(2) + "%";
        const profitRateData =
          (
            (uncomma(totalProfitEl.textContent) /
              uncomma(totalAmtEl.textContent)) *
            100
          ).toFixed(2) + "%";
        // console.log(totalProfitEl.textContent, totalProfit, profitRateData);
        setTotalProfitRate(profitRateData);
      } else {
        // input 두개에 값 없으면 "0" 표시
        evalPriceEl.textContent = "0";
        profitEl.textContent = "0";
        profitRateEl.textContent = "0";
      }

      // style 변경
      if (riseFallData === "상승") {
        changeRateEl.textContent = `+${cr_txt}%`;
        changePriceEl.textContent = `+${cp_txt}`;
        priceEl.style.color =
          changeRateEl.style.color =
          changePriceEl.style.color =
            "red";
      } else if (riseFallData === "하락") {
        changeRateEl.textContent = `${cr_txt}%`;
        changePriceEl.textContent = `${cp_txt}`;
        priceEl.style.color =
          changeRateEl.style.color =
          changePriceEl.style.color =
            "blue";
      } else {
        changeRateEl.textContent = `${cr_txt}%`;
        changePriceEl.textContent = `${cp_txt}`;
        priceEl.style.color =
          changeRateEl.style.color =
          changePriceEl.style.color =
            "black";
      }
      // price에 background 깜빡임 효과 주기
      priceEl.style.background = "linen";
      // 0.1s 후에 background 원래대로
      setTimeout(function () {
        priceEl.style.background = "white";
      }, 100);
    }
  };

  return (
    <div className="container">
      <div className="row">
        {cardSectionInfo.map((el, idx) => (
          <div className="col-lg-3 col-md-6 mb-4" key={idx}>
            <div className={`card shadow border-left-${el[0]} py-2`}>
              <div className="card-body">
                <div className="row align-items-center no-gutters">
                  <div className="col mr-2">
                    <div
                      className={`text-uppercase text-${el[0]} font-weight-bold mb-1`}
                    >
                      <span>{el[1]}</span>
                    </div>
                    <div className="text-dark font-weight-bold h5 mb-0">
                      <span id={`${el[2]}`}>{el[3]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="row">
        {chartSectionInfo.map((el, idx) => (
          <div className={`col-md-${el[0]}`} key={idx}>
            <div className="card shadow mb-4">
              <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                <h6 className="m-0 font-weight-bold text-primary">{el[1]}</h6>
              </div>
              <div className="card-body">
                <div className="chart-area">
                  <canvas id={`${el[2]}`}></canvas>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <hr />
      {/* <!-- table controller --> */}
      <div
        className={
          isMobile
            ? "row d-flex justify-content-around"
            : "row d-flex justify-content-between"
        }
      >
        <div
          className={
            isMobile ? "col-md-5 col-sm-6 d-flex justify-content-center" : null
          }
        >
          <div
            id="addStock"
            className="btn btn-light ml-2"
            role="button"
            onClick={openModal}
            ref={addButtonEl}
          >
            <i className="fas fa-plus mr-2"></i>
            종목 추가
          </div>
          <div
            className="btn btn-light text-danger ml-2"
            role="button"
            onClick={removeAllStock}
          >
            <i className="fas fa-trash mr-2"></i>
            전체 삭제
          </div>
          {modalOn ? (
            <SearchStockPopup
              modalOn={modalOn}
              setModalOn={setModalOn}
              stockData={stockData}
              setStockData={setStockData}
              ref={stockPopupEl}
              updateStockData={updateStockData}
              stockInterval={stockInterval}
              stockUpdateTime={stockUpdateTime}
            />
          ) : (
            ""
          )}
        </div>
        <div
          className={
            isMobile ? "col-md-5 col-sm-6 d-flex justify-content-center" : null
          }
        >
          <button className="btn btn-info" onClick={saveData}>
            종목 저장
          </button>
          <button className="btn btn-success ml-2" onClick={getData}>
            get data
          </button>
          <button className="btn btn-danger ml-2" onClick={stopData}>
            stop data
          </button>
        </div>
      </div>
      <hr />

      {/* <!-- DataTales --> */}
      <div className="row">
        <div className="table-responsive">
          <table className="table table-bordered" width="100%">
            <thead className="thead-light">
              <tr>
                <th>종목</th>
                <th>현재가</th>
                <th>전일대비</th>
                <th>평균단가</th>
                <th>수량</th>
                <th>평가금액</th>
                <th>평가손익</th>
                <th>수익률</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody id="dataTable">
              {stockData.length ? (
                stockData.map((stock, index) => (
                  <tr key={index} id={stock.code}>
                    <td>{stock.name}</td>
                    <td
                      id={`${
                        stock.category === "stock"
                          ? "A" + stock.code
                          : stock.code
                      }-price`}
                    ></td>
                    <td>
                      <div
                        id={`${
                          stock.category === "stock"
                            ? "A" + stock.code
                            : stock.code
                        }-changeRate`}
                      ></div>
                      <div
                        className="small"
                        id={`${
                          stock.category === "stock"
                            ? "A" + stock.code
                            : stock.code
                        }-changePrice`}
                      ></div>
                    </td>
                    <td>
                      <NumberFormat
                        className={`${styles.stockInput} avgPrice bg-light form-control small`}
                        placeholder="평균단가 입력"
                        name="avgPrice"
                        type="tel"
                        id={`${
                          stock.category === "stock"
                            ? "A" + stock.code
                            : stock.code
                        }-avgPrice`}
                        thousandSeparator={true}
                        value={stock.avgPrice ? stock.avgPrice : null}
                      />
                    </td>
                    <td>
                      <NumberFormat
                        className={`${styles.stockInput} amount bg-light form-control small`}
                        placeholder="수량 입력"
                        name="amount"
                        type="tel"
                        id={`${
                          stock.category === "stock"
                            ? "A" + stock.code
                            : stock.code
                        }-amount`}
                        thousandSeparator={true}
                        value={stock.amount ? stock.amount : null}
                      />
                    </td>
                    <td
                      className="eval"
                      id={`${
                        stock.category === "stock"
                          ? "A" + stock.code
                          : stock.code
                      }-eval`}
                    ></td>
                    <td
                      className="profit"
                      id={`${
                        stock.category === "stock"
                          ? "A" + stock.code
                          : stock.code
                      }-profit`}
                    ></td>
                    <td
                      id={`${
                        stock.category === "stock"
                          ? "A" + stock.code
                          : stock.code
                      }-yield`}
                    ></td>
                    <td>
                      <button
                        className="btn btn-light text-danger"
                        onClick={() => removeStock(stock.code, index)}
                      >
                        <i className="fas fa-trash "></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">
                    No Data...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
