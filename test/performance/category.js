import http from "k6/http";
import { sleep, check } from "k6";

/** @type {import('k6/options').Options} */
export const options = {
  thresholds: {
    http_req_duration: ["p(95)<150"],
    checks: ["rate>0.99"],
  },
  scenarios: {
    stressTest: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "5s", target: 50 },
        { duration: "10s", target: 100 },
        { duration: "5s", target: 0 },
      ],
      gracefulRampDown: 0,
      exec: "categoryList",
    },
  },
};

export function categoryList() {
  let res = http.get("http://localhost:3000/api/categories/");
  check(res, { "Get category status must 200": (res) => res.status === 200 });
}
