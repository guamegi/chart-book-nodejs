import * as axios from "axios";
import { getToday } from "common";
// import { comma, uncomma, getToday } from "common";
// import useStore from "../store/store";

/**
 * 다우,나스닥,snp,영국,프랑스,독일 지수
 * @returns card price data
 */
const addCardData = async () => {
  let data = null;

  const getHtml = async () => {
    const stockUrl = `/worldstock/index/.DJI%2C.IXIC%2C.INX%2C.FTSE%2C.FCHI%2C.GDAXI%2C.`;

    try {
      return await axios.get(process.env.REACT_APP_DB_HOST + stockUrl);
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
      return await axios.get(process.env.REACT_APP_DB_HOST + stockUrl);
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
  // let data = null;

  // stock 크롤링
  // const getHtml = async (code) => {
  const stockUrl = `/api/realtime/domestic/stock/${code}`;

  try {
    return await axios.get(process.env.REACT_APP_DB_HOST + stockUrl);
  } catch (error) {
    console.error(error);
  }
};

export { addStockData, addIndexData, addCardData };
