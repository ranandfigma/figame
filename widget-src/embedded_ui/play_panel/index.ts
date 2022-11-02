import { FPS } from "../../consts";

let keyCodeDown: string | undefined;

document.onkeydown = (e: KeyboardEvent) => {
  keyCodeDown = e.key
}

document.onkeyup = (e: KeyboardEvent) => {
  keyCodeDown = undefined
}

setInterval(() => {
  const message = { pluginMessage: { type: "tick" } };
  parent.postMessage(message, "*");

  if (keyCodeDown) {
    parent.postMessage({ pluginMessage: { type: 'keydown', keyCode: keyCodeDown } }, '*')
  }
}, 1000 / FPS);