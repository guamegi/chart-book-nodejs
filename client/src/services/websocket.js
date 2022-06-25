// const [ws, removeWebSocket] = useState([]);
import { setLineChart, initLineChart } from "../chart/area";
import { setDoughnutChart, initDoughnutChart } from "../chart/doughnut";
import { calcData } from "../chart/calcData";

let ws = [];
// 업비트 웹소켓 통신 시작함
const initWebSocket = (code = "BTC", codes = "KRW-BTC") => {
  // request data
  const json = [{ ticket: "ticket" }, { type: "ticker", codes: [codes] }];
  // console.log("ws:", ws);
  // 웹소켓 생성
  const websocket = new WebSocket("wss://api.upbit.com/websocket/v1");
  websocket.binaryType = "blob";

  ws.push(websocket);
  //   removeWebSocket((socket) => [...socket, websocket]);
  setLineChart();
  setDoughnutChart();

  // 콜백 이벤트 설정
  websocket.onopen = function (evt) {
    if (websocket.readyState === 1) {
      console.log("open socket");
      websocket.send(JSON.stringify(json));
    }
  };
  websocket.onclose = function (evt) {
    console.log("close socket");
    // console.log("ws:", ws);

    // setTimeout(function () {
    //   initWebSocket();
    //   console.log("reconnect socket");
    // }, 1000);
  };
  websocket.onmessage = function (evt) {
    const reader = new FileReader();
    reader.readAsText(evt.data);
    reader.onload = function () {
      const result = JSON.parse(reader.result);
      // console.log(result);

      calcData(code, result);

      initLineChart();
      initDoughnutChart();
    };
  };
  websocket.onerror = function (evt) {
    console.log("error");
  };
};

// ws 제거용
const removeWebSocket = (index) => {
  ws.forEach((socket, idx) => {
    if (index === idx) {
      //   console.log(index, idx, ws, socket);
      socket.close();
    }
  });
  ws.splice(index, 1);
};

const removeAllWebSocket = () => {
  ws.forEach((socket) => {
    socket.close();
  });
  ws = [];
};

export { ws, removeWebSocket, removeAllWebSocket, initWebSocket };
