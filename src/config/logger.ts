import pino, { transport } from "pino";
import pretty from "pino-pretty";

const logLevel = process.env.NODE_ENV;

export const customTransport = pino.transport({
  targets: [
    {
      //? ke unit test gak masuk karena disini delay jadi harus langsung
      target: "pino-pretty",
      options: {
        destination: process.stdout.fd,
        colorize: true,
      },
    },
    {
      target: "pino-roll",
      options: {
        file: "./logs/apps.log",
        frequency: "daily",
        dateFormat: "yyyy.MM.dd",
        size: "1m",
        mkdir: true,
      },
    },
  ],
});

export const logger =
  logLevel === "test"
    ? pino(
        //? arsitektur thread sinkron
        {
          level: "debug",
        },
        pretty({
          colorize: true,
          sync: true,
        }),
      )
    : pino(
        //? arsitektur thread terpisah
        {
          level: "debug",
          redact: {
            paths: ["*.password", "*.token"],
          },
        },
        customTransport,
      );
