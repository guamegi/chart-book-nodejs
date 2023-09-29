const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

app.use(cors()); // CORS 미들웨어 추가

// 주식 종목 시세 호출
app.use(
  createProxyMiddleware("/api", {
    target: "https://polling.finance.naver.com",
    changeOrigin: true,
  })
);

// kospi 시세 호출
app.use(
  createProxyMiddleware("/siseJson.naver", {
    target: "https://api.finance.naver.com",
    changeOrigin: true,
  })
);

// card world price 호출
app.use(
  createProxyMiddleware("/worldstock", {
    target: "https://polling.finance.naver.com/api/realtime",
    changeOrigin: true,
  })
);

// 기본 포트를 app 객체에 설정
const port = process.env.PORT || 3000;
app.listen(port);

// 리액트 정적 파일 제공
app.use(express.static(path.join(__dirname, "client/build")));

// 라우트 설정
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

console.log(`server running at http ${port}`);
