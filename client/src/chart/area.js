import { Chart } from "chart.js";
import { number_format, uncomma, getTimeStr } from "common";

// 외부에서 접근해서 데이터 조작해야 함
let myLineChart = null;
function setLineChart() {
  // console.log("myLineChart:", myLineChart);
  if (myLineChart) {
    myLineChart.update();
    // console.log("init chart");
    return;
  }
  let ctx = document.getElementById("myAreaChart");
  myLineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Earnings",
          lineTension: 0.3,
          backgroundColor: "rgba(78, 115, 223, 0.05)",
          borderColor: "rgba(78, 115, 223, 1)",
          pointRadius: 3,
          pointBackgroundColor: "rgba(78, 115, 223, 1)",
          pointBorderColor: "rgba(78, 115, 223, 1)",
          pointHoverRadius: 3,
          pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
          pointHoverBorderColor: "rgba(78, 115, 223, 1)",
          pointHitRadius: 10,
          pointBorderWidth: 2,
          data: [],
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 25,
          bottom: 0,
        },
      },
      scales: {
        xAxes: [
          {
            time: {
              unit: "date",
            },
            gridLines: {
              display: true,
              drawBorder: true,
            },
            ticks: {
              maxTicksLimit: 12,
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              maxTicksLimit: 5,
              padding: 10,
              // Include a dollar sign in the ticks
              callback: function (value, index, values) {
                return number_format(value);
              },
            },
            gridLines: {
              color: "rgb(234, 236, 244)",
              zeroLineColor: "rgb(234, 236, 244)",
              drawBorder: true,
              borderDash: [2],
              zeroLineBorderDash: [2],
            },
          },
        ],
      },
      legend: {
        display: false,
      },
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        titleMarginBottom: 10,
        titleFontColor: "#6e707e",
        titleFontSize: 14,
        borderColor: "#dddfeb",
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        intersect: false,
        mode: "index",
        caretPadding: 10,
        callbacks: {
          label: function (tooltipItem, chart) {
            var datasetLabel =
              chart.datasets[tooltipItem.datasetIndex].label || "";
            return datasetLabel + " " + number_format(tooltipItem.yLabel);
          },
        },
      },
    },
  });
}

const removeLineChart = () => {
  if (myLineChart) {
    console.log("remove chart");
    // clearInterval(lineInterval);
    myLineChart = null;
  }
};

let lineInterval = null;
const updateTime = 5000;
const initLineChart = () => {
  // console.log("line interval:", lineInterval);
  // get data시는 리턴에 걸림.
  if (lineInterval) return;

  let data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let xAxes = ["", "", "", "", "", "", "", "", "", "", "", ""];
  const totalEval = document.querySelector("#totalEval");
  const dataTable = document.querySelector("#dataTable");

  // 5초마다 총 평가금액 라인차트에 추가
  lineInterval = setInterval(function () {
    for (let i = 0; i < dataTable.childNodes.length; i++) {
      // console.log(dataTable.childNodes[i].id);
      const stockCode = dataTable.childNodes[i].id;
      let stockEl = null;
      try {
        stockEl = document.querySelector(`#${stockCode}-eval`);
      } catch {
        stockEl = document.querySelector(`#A${stockCode}-eval`);
      }

      if (!stockEl) return; // 다른 화면 전환시 에러. 예외처리
    }

    data.shift();
    data.push(uncomma(totalEval.textContent));
    myLineChart.data.datasets[0].data = data;

    const time = getTimeStr();
    xAxes.shift();
    xAxes.push(time);
    myLineChart.data.labels = xAxes;

    myLineChart.update();
  }, updateTime);
};

export { setLineChart, initLineChart, removeLineChart };
