var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-FPMR8z/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/bundle-FPMR8z/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// api/index.js
var MOCK_DATA = {
  btc: {
    symbol: "BTC",
    name: "Bitcoin",
    galaxyScore: 75.2,
    altRank: 1,
    socialVolume: 15420,
    price: 104567.89,
    priceChange24h: -2.14,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  },
  eth: {
    symbol: "ETH",
    name: "Ethereum",
    galaxyScore: 68.5,
    altRank: 2,
    socialVolume: 12890,
    price: 3840.23,
    priceChange24h: 1.87,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  },
  sol: {
    symbol: "SOL",
    name: "Solana",
    galaxyScore: 62.1,
    altRank: 5,
    socialVolume: 8750,
    price: 248.67,
    priceChange24h: 4.32,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  },
  ada: {
    symbol: "ADA",
    name: "Cardano",
    galaxyScore: 45.8,
    altRank: 12,
    socialVolume: 4200,
    price: 1.23,
    priceChange24h: -0.95,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  }
};
function getMockData(symbol) {
  const lowerSymbol = symbol.toLowerCase();
  if (MOCK_DATA[lowerSymbol]) {
    return { ...MOCK_DATA[lowerSymbol], isMockData: true };
  }
  return {
    symbol: symbol.toUpperCase(),
    name: `${symbol.toUpperCase()} Token`,
    galaxyScore: Math.round((Math.random() * 80 + 10) * 10) / 10,
    altRank: Math.floor(Math.random() * 500) + 1,
    socialVolume: Math.floor(Math.random() * 1e4),
    price: Math.round((Math.random() * 1e3 + 0.01) * 100) / 100,
    priceChange24h: Math.round((Math.random() * 20 - 10) * 100) / 100,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    isMockData: true
  };
}
__name(getMockData, "getMockData");
var api_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    if (url.pathname === "/api/health") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          hasApiKey: !!env.LUNARCRUSH_API_KEY
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
    if (url.pathname.startsWith("/api/sentiment/")) {
      const symbol = url.pathname.split("/")[3];
      if (!symbol || !/^[A-Za-z]{2,10}$/.test(symbol)) {
        return new Response(
          JSON.stringify({
            error: "Invalid symbol format",
            message: "Symbol must be 2-10 letters only (e.g., BTC, ETH)"
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }
      if (!env.LUNARCRUSH_API_KEY) {
        console.log("No API key available, using mock data");
        const mockData = getMockData(symbol);
        return new Response(JSON.stringify(mockData), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=60"
            // Shorter cache for mock data
          }
        });
      }
      try {
        const response = await fetch(
          `https://lunarcrush.com/api4/public/coins/${symbol.toLowerCase()}/v1`,
          {
            headers: {
              Authorization: `Bearer ${env.LUNARCRUSH_API_KEY}`
            }
          }
        );
        if (response.status === 401 || response.status === 403) {
          console.log("API key invalid or unauthorized, using mock data");
          const mockData = getMockData(symbol);
          return new Response(JSON.stringify(mockData), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "public, max-age=60"
            }
          });
        }
        if (!response.ok) {
          throw new Error(`LunarCrush API error: ${response.status}`);
        }
        const data = await response.json();
        if (!data.data) {
          return new Response(
            JSON.stringify({
              error: "Symbol not found",
              message: `Cryptocurrency symbol '${symbol.toUpperCase()}' not found. Try BTC, ETH, SOL, ADA, etc.`
            }),
            {
              status: 404,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              }
            }
          );
        }
        const coinData = data.data;
        const formatted = {
          symbol: symbol.toUpperCase(),
          name: coinData.name || "Unknown",
          galaxyScore: coinData.galaxy_score || 0,
          altRank: coinData.alt_rank || 0,
          socialVolume: coinData.social_volume_24h || 0,
          price: coinData.price || 0,
          priceChange24h: coinData.percent_change_24h || 0,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          isMockData: false
        };
        return new Response(JSON.stringify(formatted), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=300"
          }
        });
      } catch (error) {
        console.log("API call failed, using mock data:", error.message);
        const mockData = getMockData(symbol);
        return new Response(JSON.stringify(mockData), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=60"
          }
        });
      }
    }
    return env.ASSETS.fetch(request);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-FPMR8z/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = api_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-FPMR8z/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
