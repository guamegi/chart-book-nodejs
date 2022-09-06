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
  // getHtml(code).then((html) => {
  // console.log(data);
  const priceData = data.closePrice;
  const changeRateData = data.fluctuationsRatio;
  const changePriceData = data.compareToPreviousClosePrice;
  const riseFallData = data.compareToPreviousPrice.text;

  const totalAmt = document.querySelector("#totalAmt"); // 총 매수
  const totalEval = document.querySelector("#totalEval"); // 총 평가
  const totalProfit = document.querySelector("#totalProfit"); // 평가손익
  const totalProfitRate = document.querySelector("#totalProfitRate"); // 수익률

  const price = document.querySelector(`#A${data.itemCode}-price`);
  const changeRate = document.querySelector(`#A${data.itemCode}-changeRate`);
  const changePrice = document.querySelector(`#A${data.itemCode}-changePrice`);

  const avgPriceInput = document.querySelector(`#A${data.itemCode}-avgPrice`);
  const amountInput = document.querySelector(`#A${data.itemCode}-amount`);

  const evalPrice = document.querySelector(`#A${data.itemCode}-eval`);
  const profit = document.querySelector(`#A${data.itemCode}-profit`);
  const profitRate = document.querySelector(`#A${data.itemCode}-yield`);

  if (price) {
    price.textContent = priceData;
    changeRate.textContent = changeRateData;
    changePrice.textContent = changePriceData;

    // input 두개에 값이 있으면, 평가금액/평가손익/수익률 갱신하기
    if (avgPriceInput.value && amountInput.value) {
      //   console.log(avgPriceInput.value, amountInput.value);
      evalPrice.textContent = comma(
        (uncomma(priceData) * uncomma(amountInput.value)).toFixed(0)
      );
      profit.textContent = comma(
        (
          uncomma(priceData) * uncomma(amountInput.value) -
          uncomma(avgPriceInput.value) * uncomma(amountInput.value)
        ).toFixed(0)
      );
      profitRate.textContent =
        (
          (uncomma(priceData) / uncomma(avgPriceInput.value)) * 100 -
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
      totalAmt.textContent = comma(amtNum.toFixed(0));

      // total eval 계산
      const allEvalEl = document.querySelectorAll(".eval");
      let allEvalNum = 0;
      allEvalEl.forEach(function (e) {
        allEvalNum += parseFloat(uncomma(e.innerText));
      });
      totalEval.textContent = comma(allEvalNum.toFixed(0));

      // total profit 계산
      const allProfitEl = document.querySelectorAll(".profit");
      let allProfitNum = 0;
      allProfitEl.forEach((e) => {
        allProfitNum += parseFloat(uncomma(e.innerText));
      });
      totalProfit.textContent = comma(allProfitNum.toFixed(0));

      // total 수익률 계산
      totalProfitRate.textContent =
        (
          (uncomma(totalProfit.textContent) / uncomma(totalAmt.textContent)) *
          100
        ).toFixed(2) + "%";
    } else {
      // input 두개에 값 없으면 "0" 표시
      evalPrice.textContent = "0";
      profit.textContent = "0";
      profitRate.textContent = "0";
    }

    // style 변경
    if (riseFallData === "상승") {
      changeRate.textContent = `+${changeRateData}%`;
      changePrice.textContent = `+${changePriceData}`;
      price.style.color =
        changeRate.style.color =
        changePrice.style.color =
          "red";
    } else if (riseFallData === "하락") {
      changeRate.textContent = `${changeRateData}%`;
      changePrice.textContent = `${changePriceData}`;
      price.style.color =
        changeRate.style.color =
        changePrice.style.color =
          "blue";
    } else {
      changeRate.textContent = `${changeRateData}%`;
      changePrice.textContent = `${changePriceData}`;
      price.style.color =
        changeRate.style.color =
        changePrice.style.color =
          "black";
    }
    // price에 background 깜빡임 효과 주기
    price.style.background = "linen";
    // 0.1s 후에 background 원래대로
    setTimeout(function () {
      price.style.background = "white";
    }, 100);
  }
  // });
};

export { addStockData, addIndexData, addCardData };
