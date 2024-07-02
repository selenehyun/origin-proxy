import { serve } from "https://deno.land/std/http/server.ts";

const PORT = 3000;

function getTargetDomain(hostname: string): string {
  // 도메인 A의 주소를 반환
  return (
    {
      "climb.place": "selenehyun.notion.site",
      "scalare.climb.place": "selenehyun.notion.site",
    }[hostname] || "selenehyun.notion.site"
  );
}

async function handleRequest(req: Request): Promise<Response> {
  try {
    const originalUrl = new URL(req.url);

    const TARGET_DOMAIN = getTargetDomain(originalUrl.hostname);

    // IP를 사용하여 URL 생성
    const targetUrl = new URL(
      `https://${TARGET_DOMAIN}${originalUrl.pathname}${originalUrl.search}`
    );

    const fetchRequest = new Request(targetUrl.toString(), {
      method: req.method,
      headers: new Headers(req.headers),
      body: req.body,
    });

    // 'Host' 헤더를 TARGET_DOMAIN으로 설정
    fetchRequest.headers.set("Host", TARGET_DOMAIN);

    const response = await fetch(fetchRequest);

    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });

    return newResponse;
  } catch (error) {
    console.error("오류 발생:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
await serve(handleRequest, { port: PORT });
