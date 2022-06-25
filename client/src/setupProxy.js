const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (app) => {
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
};
