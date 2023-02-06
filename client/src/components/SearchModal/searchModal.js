import React, { forwardRef, useState } from "react";

import stockList from "data/stockList";
import { initWebSocket } from "services/websocket";
import { addStockData } from "services/crawler";
import styles from "./searchModal.module.css";

const SearchModal = forwardRef((props, ref) => {
  // console.log(props, ref);
  const {
    modalOn,
    setModalOn,
    stockData,
    setStockData,
    updateStockData,
    stockInterval,
    stockUpdateTime,
  } = props;
  const [searchList, setSearchList] = useState([]);

  async function selectStockList(code) {
    // popup 닫기
    setModalOn(!modalOn);

    // stockList 에 해당 code와 같은 종목 저장
    let stock = stockList.find((list) => list.code === code);

    // 중복 코드는 생성 안함
    if (stockData.filter((e) => e.code === code).length > 0) {
      alert("동일한 종목이 존재합니다. 다시 선택해주세요!");
      return;
    }
    // 해당 종목의 table 추가
    await setStockData((list) => [...list, stock]);

    let avgPriceInput = null;
    if (stock.category === "stock") {
      const stockData = await addStockData(stock.code).then(
        (html) => html.data.datas[0]
      );
      updateStockData(stockData);

      avgPriceInput = document.querySelector(`#A${stock.code}-avgPrice`);

      // stock 반복 호출
      stockInterval[stock.code] = setInterval(async function () {
        const stockData = await addStockData(stock.code).then(
          (html) => html.data.datas[0]
        );
        updateStockData(stockData);
      }, stockUpdateTime);
    } else {
      // coin 시세 호출
      await initWebSocket(stock.code, stock.codes);

      avgPriceInput = document.querySelector(`#${stock.code}-avgPrice`);
    }
    // add 하면 input 에 포커스
    avgPriceInput.focus();
  }

  // 종목 검색 필터
  const searchStock = (e) => {
    // console.log(e.target.value);
    // stockList에서 입력된 종목 검색
    const words = stockList.filter((stock) =>
      stock.name.includes(e.target.value.toUpperCase())
    );
    // console.log(words);
    setSearchList(words);
  };

  const makeStockList = (stock) => {
    return (
      <li key={stock.code} onClick={() => selectStockList(stock.code)}>
        <div className="row">
          <span className="col mr-2">{stock.name}</span>
          <span className="col-auto">
            <small className="font-weight-light">{stock.code}</small>
          </span>
        </div>
      </li>
    );
  };

  return (
    <div className={styles.container}>
      <div className="input-group">
        <input
          className="bg-light form-control small"
          type="text"
          placeholder="종목명 입력"
          ref={ref}
          onChange={searchStock}
          autoFocus
        />
        <div className="input-group-append">
          <button className="btn btn-primary py-0" type="button">
            <i className="fas fa-search" />
          </button>
        </div>
      </div>
      <div className={styles.stockList}>
        <ul>
          {searchList.length > 0
            ? searchList.map((stock) => makeStockList(stock))
            : stockList.map((stock) => makeStockList(stock))}
        </ul>
      </div>
    </div>
  );
});

export default SearchModal;
