import http from "node:http";
import { json } from "./middleware/json.js";
import { routes } from "./routes.js";
import { extractQuery } from "./utils/extractQuery.js";

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  await json(req, res);

  const route = routes.find((route) => route.method === method && route.path.test(url));

  if (route) {
    const { groups } = req.url.match(route.path);
    const { query, ...params } = groups;
    req.query = query ? extractQuery(query) : {};
    req.params = params;
    return route.handler(req, res);
  }

  return res.writeHead(404).end("Not found");
});

server.listen(3333);
