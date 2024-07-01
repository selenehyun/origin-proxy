const http = require("http");
const https = require("https");
const dns = require("dns");

const PORT = 3000;
const TARGET_DOMAIN = "selenehyun.notion.site"; // 도메인 A의 주소

// DNS 조회 함수
function lookupPromise(hostname) {
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, (err, address) => {
      if (err) reject(err);
      else resolve(address);
    });
  });
}

const server = http.createServer(async (req, res) => {
  try {
    // 도메인 A의 IP 주소 조회
    const ip = await lookupPromise(TARGET_DOMAIN);

    const options = {
      hostname: ip,
      port: 443,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        Host: TARGET_DOMAIN, // 원본 호스트 헤더 유지
      },
    };

    const proxyReq = https.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    req.pipe(proxyReq);

    proxyReq.on("error", (error) => {
      console.error("요청 오류:", error);
      res.writeHead(500);
      res.end("Internal Server Error");
    });
  } catch (error) {
    console.error("DNS 조회 오류:", error);
    res.writeHead(500);
    res.end("DNS Lookup Error");
  }
});

server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
