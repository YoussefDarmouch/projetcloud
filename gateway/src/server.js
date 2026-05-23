const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

const app = express();

const PORT = Number(process.env.PORT || 8080);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost";

const serviceUrl = {
  auth: process.env.AUTH_SERVICE_URL || "http://auth-service:3001",
  joueurs: process.env.JOUEUR_SERVICE_URL || "http://joueur-service:3002",
  classements:
    process.env.CLASSEMENT_SERVICE_URL || "http://classemants-service:3003",
  equipes: process.env.EQUIPE_SERVICE_URL || "http://equipes-service:3004",
  reservations:
    process.env.RESERVATION_SERVICE_URL || "http://reservation-service:3005",
  match: process.env.MATCH_SERVICE_URL || "http://match-service:3006",
};

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests" },
  })
);

app.use((req, res, next) => {
  req.requestId = req.headers["x-request-id"] || uuidv4();
  res.setHeader("x-request-id", req.requestId);
  next();
});

app.use(
  morgan(
    ':method :url :status :response-time ms request_id=:req[x-request-id] remote=:remote-addr'
  )
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "api-gateway" });
});

function createProxy(baseUrl, apiPrefix) {
  return async (req, res) => {
    try {
      const path = req.originalUrl.replace(apiPrefix, "");
      const targetUrl = `${baseUrl}${apiPrefix.replace("/api", "")}${path}`;

      const headers = {
        authorization: req.headers.authorization || "",
        cookie: req.headers.cookie || "",
        "x-request-id": req.requestId,
      };

      if (req.headers["content-type"]) {
        headers["content-type"] = req.headers["content-type"];
      }

      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body:
          req.method === "GET" || req.method === "HEAD"
            ? undefined
            : JSON.stringify(req.body || {}),
      });

      const contentType = response.headers.get("content-type") || "";
      if (contentType) {
        res.setHeader("content-type", contentType);
      }
      const payload = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      return res.status(response.status).send(payload);
    } catch (error) {
      return res.status(502).json({
        error: "Bad gateway",
        details: error.message,
        requestId: req.requestId,
      });
    }
  };
}

app.use("/api/auth", createProxy(serviceUrl.auth, "/api/auth"));
app.use("/api/joueurs", createProxy(serviceUrl.joueurs, "/api/joueurs"));
app.use(
  "/api/classements",
  createProxy(serviceUrl.classements, "/api/classements")
);
app.use("/api/equipes", createProxy(serviceUrl.equipes, "/api/equipes"));
app.use(
  "/api/reservations",
  createProxy(serviceUrl.reservations, "/api/reservations")
);
app.use("/api/match", createProxy(serviceUrl.match, "/api/match"));

app.use((err, req, res, _next) => {
  console.error("Gateway error:", err);
  res.status(500).json({
    error: "Internal gateway error",
    requestId: req.requestId,
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
