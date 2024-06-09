declare global {
  var env: Env;
}

type Env = {
  baseUrl: string;
};

const localEnv = {
  baseUrl: "http://localhost:3000",
};

const prodEnv = {
  baseUrl: "https://ti4-lab.fly.dev",
};

export function initEnv() {
  global.env = process.env.NODE_ENV === "production" ? prodEnv : localEnv;
}
