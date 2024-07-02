import { serve } from "https://deno.land/std/http/server.ts";

const PORT = 3000;
const TARGET_DOMAIN = "www.example.com"; // 도메인 A의 주소

async function lookupIP(hostname: string): Promise<string> {
  const resolver = new Deno.Resolver();
  const addresses = await resolver.resolve(hostname, "A");
  return addresses[0];
}

async function handleRequest(req: Request): Promise<Response> {
  try {
    const ip = await lookupIP(TARGET_DOMAIN);
    const url = new URL(req.url);
    const targetUrl = `https://${ip}${url.pathname}${url.search}`;

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        Host: TARGET_DOMAIN,
      },
      body: req.body,
    });

    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error("오류 발생:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
await serve(handleRequest, { port: PORT });
