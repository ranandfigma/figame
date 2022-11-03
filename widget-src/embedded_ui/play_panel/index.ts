import { FPS } from "../../consts";

let gameStarted = false;
if (!gameStarted) {
    console.log('signaling initialize scripts');
    const message = { pluginMessage: { type: "gameInit" } };
    parent.postMessage(message, "*");
}

let keyCodeDown: string | undefined;

document.onkeydown = (e: KeyboardEvent) => {
    keyCodeDown = e.key
}

document.onkeyup = (e: KeyboardEvent) => {
    keyCodeDown = undefined
}

// TODO: send all keyup/ keydown events to the main thread to handle.
// TODO: Use the widget state to define and render controls.
// TODO: move the camera to the center of the "camera frame" on start.

setInterval(() => {
    const message = { pluginMessage: { type: "tick" } };
    parent.postMessage(message, "*");

    if (keyCodeDown) {
        parent.postMessage({ pluginMessage: { type: 'keydown', keyCode: keyCodeDown } }, '*')
    }
}, 1000 / FPS);
