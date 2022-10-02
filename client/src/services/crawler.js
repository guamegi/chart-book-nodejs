import * as axios from "axios";
import { comma, uncomma, getToday } from "common";

/**
 * 다우,나스닥,snp,영국,프랑스,독일 지수
 * @returns card price data
 */
const addCardData = async () => {
  let data = null;

  const getHtml = async () => {
    const stockUrl = `/worldstock/index/.DJI%2C.IXIC%2C.INX%2C.FTSE%2C.FCHI%2C.GDAXI%2C.`;

    try {
      return await axios.get(stockUrl);
    } catch (error) {
      console.error(error);
    }
  };
  await getHtml().then((html) => {
    // return html.data.datas;
    data = html.data.datas;
  });

  return data;
};

// 코스피,코스닥,선물 data 호출
const addIndexData = async (symbol = "KOSPI", timeframe = "day") => {
  let data = null;

  // chart 기간 설정
  const endTime = getToday();
  const startTime = String(endTime - 100000); // (현재날짜 - 10년 전)

  // index 크롤링
  const getHtml = async (symbol, startTime, endTime, timeframe) => {
    // console.log(symbol, startTime, endTime, timeframe);
    const stockUrl = `/siseJson.naver?symbol=${symbol}&requestType=1&startTime=${startTime}&endTime=${endTime}&timeframe=${timeframe}`;

    try {
      return await axios.get(stockUrl);
    } catch (error) {
      console.error(error);
    }
  };

  await getHtml(symbol, startTime, endTime, timeframe).then((html) => {
    // console.log(html.data, typeof html.data);
    let tempData = html.data.replaceAll("'", '"');
    data = JSON.parse(tempData);
  });

  return data;
};

// 종목 추가(주식)시 호출
const addStockData = async (code) => {
  let data = null;

  // stock 크롤링
  const getHtml = async (code) => {
    const stockUrl = `/api/realtime/domestic/stock/${code}`;

    try {
      return await axios.get(stockUrl);
    } catch (error) {
      console.error(error);
    }
  };

  await getHtml(code).then((html) => {
    // console.log(html.data, typeof html.data);
    data = html.data.datas[0];
  });

  setStockData(data);
};

// 주식 데이터 셋팅
const setStockData = (data) => {
  if (!data) return;
  // console.log(data);
  const priceData = data.closePrice;
  const cr_txt = data.fluctuationsRatio; // change rate
  const cp_txt = data.compareToPreviousClosePrice; // change price
  const riseFallData = data.compareToPreviousPrice.text;

  const totalAmtEl = document.querySelector("#totalAmt"); // 총 매수
  const totalEvalEl = document.querySelector("#totalEval"); // 총 평가
  const totalProfitEl = document.querySelector("#totalProfit"); // 평가손익
  const totalProfitRateEl = document.querySelector("#totalProfitRate"); // 수익률

  const priceEl = document.querySelector(`#A${data.itemCode}-price`);
  const changeRateEl = document.querySelector(`#A${data.itemCode}-changeRate`);
  const changePriceEl = document.querySelector(
    `#A${data.itemCode}-changePrice`
  );

  const avgPriceInputEl = document.querySelector(`#A${data.itemCode}-avgPrice`);
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
      totalAmtEl.textContent = comma(amtNum.toFixed(0));

      // total eval 계산
      const allEvalEl = document.querySelectorAll(".eval");
      let allEvalNum = 0;
      allEvalEl.forEach(function (e) {
        allEvalNum += parseFloat(uncomma(e.innerText));
      });
      totalEvalEl.textContent = comma(allEvalNum.toFixed(0));

      // total profit 계산
      const allProfitEl = document.querySelectorAll(".profit");
      let allProfitNum = 0;
      allProfitEl.forEach((e) => {
        allProfitNum += parseFloat(uncomma(e.innerText));
      });
      totalProfitEl.textContent = comma(allProfitNum.toFixed(0));

      // total 수익률 계산
      totalProfitRateEl.textContent =
        (
          (uncomma(totalProfitEl.textContent) /
            uncomma(totalAmtEl.textContent)) *
          100
        ).toFixed(2) + "%";
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

export { addStockData, addIndexData, addCardData };
