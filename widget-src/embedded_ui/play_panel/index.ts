import { FPS } from "../../consts";

// TODO: send all keyup/ keydown events to the main thread to handle.
// TODO: Use the widget state to define and render controls.
// TODO: move the camera to the center of the "camera frame" on start.


setInterval(() => {
  const message = { pluginMessage: { type: "tick" } };
  parent.postMessage(message, "*");
}, 1000 / FPS);
