import { Chart } from "chart.js";
import { uncomma } from "common";

let myDoughnutChart = null;
function setDoughnutChart() {
  // console.log("myDoughnutChart:", myDoughnutChart);
  if (myDoughnutChart) {
    myDoughnutChart.update();
    // console.log("init chart");
    return;
  }
  // Pie Chart
  let ctx = document.getElementById("myDoughnutChart");
  myDoughnutChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [
            "#4e73df",
            "#1cc88a",
            "#36b9cc",
            "#f57c10",
            "#ffff33",
            "#fc4514",
            "#f518f9",
            "#8a8a8a",
          ],
          hoverBackgroundColor: [
            "#2e59d9",
            "#17a673",
            "#2c9faf",
            "#c86710",
            "#cdcd25",
            "#c33813",
            "#ca14cd",
            "#6e6d6d",
          ],
          hoverBorderColor: "rgba(234, 236, 244, 1)",
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        borderColor: "#dddfeb",
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: true,
        caretPadding: 10,
      },
      legend: {
        display: true,
        position: "right",
        align: "end",
      },
      cutoutPercentage: 70,
    },
  });
}

let doughnutInterval = null;
const updateTime = 5000;
const initDoughnutChart = () => {
  if (doughnutInterval) return;
  const totalEval = document.querySelector("#totalEval");
  const dataTable = document.querySelector("#dataTable");
  // console.log(dataTable.childNodes);

  // 추가된 종목들의 평가금액 가져와서 비율 계산한 다음 데이터 넣기
  doughnutInterval = setInterval(function () {
    let data = [];
    let name = [];
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
      const price =
        (uncomma(stockEl.textContent) / uncomma(totalEval.textContent)) * 100;
      data.push(price.toFixed(0));
    }

    // 도넛차트 legend: name 으로 넣기
    const dataTableEl = document.querySelector("#dataTable").childNodes;

    for (let i = 0; i < dataTableEl.length; i++) {
      name.push(dataTableEl[i].firstChild.firstChild.textContent);
    }
    myDoughnutChart.data.datasets[0].data = data;
    myDoughnutChart.data.labels = name.length > 0 ? name : "-";
    myDoughnutChart.update();
  }, updateTime);
};

const removeDoughnutChart = () => {
  if (myDoughnutChart) {
    myDoughnutChart = null;
  }
};

export { setDoughnutChart, initDoughnutChart, removeDoughnutChart };
