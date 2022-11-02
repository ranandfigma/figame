import { FPS } from "../../consts";

setInterval(() => {
  const message = { pluginMessage: { type: "tick" } };
  parent.postMessage(message, "*");
}, 1000 / FPS);