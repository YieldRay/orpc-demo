interface WebServer {
  (request: Request): Response | Promise<Response>;
  fetch: (request: Request) => Response | Promise<Response>;
}

export function createWebServer(handler: WebServer["fetch"]): WebServer {
  const s = handler as WebServer;
  s.fetch = handler;
  return s;
}
