import express, { type Application } from "express";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";
import userRouter from "./routes/user.router";
import { errorMiddleware } from "./middleware/error.middleware";
import cookieParser from "cookie-parser";
import cors from "cors";
import contactRouter from "./routes/contact.router";
import addressRouter from "./routes/address.router";
import CategoryRouter from "./routes/category.router";

export const app: Application = express();

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(
  pinoHttp({
    logger,
    autoLogging: false,
    customLogLevel: (_req, res, err) => {
      if (res.statusCode >= 500 || err) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    redact: ["req.headers.authorization", "req.headers.cookie"],
  }),
);

//? Route
app.use("/api/users", userRouter);
app.use("/api/contacts", contactRouter);
app.use("/api/contacts/:contactId/addresses", addressRouter);
app.use("/api/categories", CategoryRouter);
app.use(errorMiddleware);

app.get("/", (req, res) => {
  req.log.info({ tester: "tester" });
  logger.error("jabron lagi error");
  logger.fatal("jabron lagi fatal banget");
  res.send("Server is live heloo jym");
});
