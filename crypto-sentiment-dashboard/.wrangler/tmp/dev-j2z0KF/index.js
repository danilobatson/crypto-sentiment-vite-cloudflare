var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-AjSd6n/strip-cf-connecting-ip-header.js
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
    price: 104080.81,
    galaxyScore: 46.3,
    altRank: 306,
    marketCap: 206857864500758e-2,
    volume24h: 4197630511699e-2,
    percentChange24h: -1.07,
    percentChange7d: -2.54,
    percentChange30d: 7.27,
    volatility: 45e-4,
    marketCapRank: 1,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  },
  eth: {
    symbol: "ETH",
    name: "Ethereum",
    price: 3840.23,
    galaxyScore: 68.5,
    altRank: 2,
    marketCap: 45e10,
    volume24h: 15e9,
    percentChange24h: 1.87,
    percentChange7d: -1.23,
    percentChange30d: 12.45,
    volatility: 67e-4,
    marketCapRank: 2,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  },
  sol: {
    symbol: "SOL",
    name: "Solana",
    price: 248.67,
    galaxyScore: 62.1,
    altRank: 5,
    marketCap: 118e9,
    volume24h: 32e8,
    percentChange24h: 4.32,
    percentChange7d: 8.91,
    percentChange30d: 22.15,
    volatility: 89e-4,
    marketCapRank: 5,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  },
  ada: {
    symbol: "ADA",
    name: "Cardano",
    price: 1.23,
    galaxyScore: 45.8,
    altRank: 12,
    marketCap: 42e9,
    volume24h: 89e7,
    percentChange24h: -0.95,
    percentChange7d: 2.14,
    percentChange30d: -3.67,
    volatility: 56e-4,
    marketCapRank: 8,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  },
  dot: {
    symbol: "DOT",
    name: "Polkadot",
    price: 8.45,
    galaxyScore: 52.3,
    altRank: 18,
    marketCap: 125e8,
    volume24h: 32e7,
    percentChange24h: 2.67,
    percentChange7d: -1.89,
    percentChange30d: 15.42,
    volatility: 78e-4,
    marketCapRank: 12,
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
    price: Math.round((Math.random() * 1e3 + 0.01) * 100) / 100,
    galaxyScore: Math.round((Math.random() * 80 + 10) * 10) / 10,
    altRank: Math.floor(Math.random() * 500) + 1,
    marketCap: Math.floor(Math.random() * 1e11),
    volume24h: Math.floor(Math.random() * 5e9),
    percentChange24h: Math.round((Math.random() * 20 - 10) * 100) / 100,
    percentChange7d: Math.round((Math.random() * 30 - 15) * 100) / 100,
    percentChange30d: Math.round((Math.random() * 50 - 25) * 100) / 100,
    volatility: Math.round(Math.random() * 0.01 * 1e4) / 1e4,
    marketCapRank: Math.floor(Math.random() * 1e3) + 1,
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
        if (response.ok) {
          const data = await response.json();
          if (!data.data) {
            return new Response(
              JSON.stringify({
                error: "Cryptocurrency not found",
                message: `The cryptocurrency "${symbol.toUpperCase()}" was not found. Please check the symbol and try again.`,
                suggestion: "Try popular symbols like BTC, ETH, SOL, ADA, MATIC, DOT, etc."
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
            price: coinData.price || 0,
            galaxyScore: coinData.galaxy_score || 0,
            altRank: coinData.alt_rank || 0,
            marketCap: coinData.market_cap || 0,
            volume24h: coinData.volume_24h || 0,
            percentChange24h: coinData.percent_change_24h || 0,
            percentChange7d: coinData.percent_change_7d || 0,
            percentChange30d: coinData.percent_change_30d || 0,
            volatility: coinData.volatility || 0,
            marketCapRank: coinData.market_cap_rank || 0,
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
        } else {
          console.log(
            "LunarCrush API server error, using mock data:",
            response.status
          );
          const mockData = getMockData(symbol);
          return new Response(JSON.stringify(mockData), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "public, max-age=60"
            }
          });
        }
      } catch (error) {
        console.log(
          "API call failed due to network/exception, using mock data:",
          error.message
        );
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
    if (url.pathname === "/api/health") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
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

// .wrangler/tmp/bundle-AjSd6n/middleware-insertion-facade.js
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

// .wrangler/tmp/bundle-AjSd6n/middleware-loader.entry.ts
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
