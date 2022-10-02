import { comma, uncomma } from "common";

const calcData = (code, result) => {
  if (!code || !result) return;
  // console.log(code, result);
  const priceData = result.trade_price;
  const cr_txt = (result.change_rate * 100).toFixed(2); // change rate
  const cp_txt = comma(result.change_price); // change priceEl
  const riseFallData = result.change;

  // 특정 id에 실시간 데이터 표시
  const totalAmtEl = document.querySelector("#totalAmt");
  const totalEvalEl = document.querySelector("#totalEval");
  const totalProfitEl = document.querySelector("#totalProfit");
  const totalProfitRateEl = document.querySelector("#totalProfitRate");

  const priceEl = document.querySelector(`#${code}-price`);
  const changeRateEl = document.querySelector(`#${code}-changeRate`);
  const changePriceEl = document.querySelector(`#${code}-changePrice`);

  const avgPriceInputEl = document.querySelector(`#${code}-avgPrice`);
  const amountInputEl = document.querySelector(`#${code}-amount`);

  const evalPriceEl = document.querySelector(`#${code}-eval`);
  const profitEl = document.querySelector(`#${code}-profit`);
  const profitRateEl = document.querySelector(`#${code}-yield`);

  if (priceEl) {
    priceEl.textContent = comma(priceData);

    // input 두개에 값이 있으면, 평가금액/평가손익/수익률 갱신하기
    if (avgPriceInputEl.value && amountInputEl.value) {
      //   console.log(avgPriceInputEl.value, amountInputEl.value);
      evalPriceEl.textContent = comma(
        (uncomma(priceEl.textContent) * uncomma(amountInputEl.value)).toFixed(0)
      );
      profitEl.textContent = comma(
        (
          uncomma(priceEl.textContent) * uncomma(amountInputEl.value) -
          uncomma(avgPriceInputEl.value) * uncomma(amountInputEl.value)
        ).toFixed(0)
      );
      profitRateEl.textContent =
        (
          (uncomma(priceEl.textContent) / uncomma(avgPriceInputEl.value)) *
            100 -
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
    if (riseFallData === "RISE") {
      changeRateEl.textContent = `+${cr_txt}%`;
      changePriceEl.textContent = `+${cp_txt}`;
      priceEl.style.color =
        changeRateEl.style.color =
        changePriceEl.style.color =
          "red";
    } else if (riseFallData === "FALL") {
      changeRateEl.textContent = `-${cr_txt}%`;
      changePriceEl.textContent = `-${cp_txt}`;
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

export { calcData };
