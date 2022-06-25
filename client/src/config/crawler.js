import * as axios from "axios";
import { comma, uncomma } from "common";

// card data 호출
const addCardData = async () => {
  let data = null;

  const getHtml = async () => {
    const stockUrl = `worldstock/index/.DJI%2C.IXIC%2C.INX%2C.FTSE%2C.FCHI%2C.GDAXI%2C.`;

    try {
      return await axios.get(stockUrl);
    } catch (error) {
      console.error(error);
    }
  };
  await getHtml().then((html) => {
    // console.log(html.data.datas);
    // return html.data.datas;
    data = html.data.datas;
  });

  return data;
};

// 코스피,코스닥,선물 data 호출
const addIndexData = async (symbol = "KOSPI", timeframe = "day") => {
  let data = null;

  const getToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);

    return year + month + day;
  };

  // chart 기간 설정
  const startTime = "20100101";
  const endTime = getToday();

  // index 크롤링
  const getHtml = async (symbol, startTime, endTime, timeframe) => {
    // console.log(symbol, startTime, endTime, timeframe);
    // const stockUrl = `/siseJson.naver?symbol=KOSPI&requestType=1&startTime=20200811&endTime=20210412&timeframe=day`;
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

const addStockData = (code) => {
  // stock 크롤링
  const getHtml = async (code) => {
    const stockUrl = `/api/realtime/domestic/stock/${code}`;

    try {
      return await axios.get(stockUrl);
    } catch (error) {
      console.error(error);
    }
  };

  getHtml(code).then((html) => {
    // console.log(html);
    const priceData = html.data.datas[0].closePrice;
    const changeRateData = html.data.datas[0].fluctuationsRatio;
    const changePriceData = html.data.datas[0].compareToPreviousClosePrice;
    const riseFallData = html.data.datas[0].compareToPreviousPrice.text;

    const totalAmt = document.querySelector("#totalAmt");
    const totalEval = document.querySelector("#totalEval");
    const totalProfit = document.querySelector("#totalProfit");
    const totalProfitRate = document.querySelector("#totalProfitRate");

    const price = document.querySelector(`#A${code}-price`);
    const changeRate = document.querySelector(`#A${code}-changeRate`);
    const changePrice = document.querySelector(`#A${code}-changePrice`);

    const avgPriceInput = document.querySelector(`#A${code}-avgPrice`);
    const amountInput = document.querySelector(`#A${code}-amount`);

    const evalPrice = document.querySelector(`#A${code}-eval`);
    const profit = document.querySelector(`#A${code}-profit`);
    const profitRate = document.querySelector(`#A${code}-yield`);

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
  });
};

export { addStockData, addIndexData, addCardData };
