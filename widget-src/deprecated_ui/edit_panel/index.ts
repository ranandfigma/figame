import {
  WidgetToUiMessage,
  WidgetToUiMessageBody,
  WidgetToUiMessageType,
} from "../../messages";
import { NodeState } from "../../node";

enum elementId {
  velocityX = "velocityX",
  velocityY = "velocityY",
  submit = "submit",
}

const submitButton = document.getElementById(elementId.submit);
const velocityX = document.getElementById(
  elementId.velocityX
) as HTMLInputElement;
const velocityY = document.getElementById(
  elementId.velocityY
) as HTMLInputElement;

// The only way to communicate widget state from the main thread is here. Store
// it as a global and read from it as needed. This is suboptimal if the message
// hasn't been sent yet, but we can solve that later.
let currentNodeState: NodeState | undefined;
addEventListener("message", (event) => {
  console.log(event);
  const data: WidgetToUiMessage<WidgetToUiMessageType> = event.data;
  const typ = data?.pluginMessage?.type;
  switch (typ) {
    case WidgetToUiMessageType.NodeState:
      type bodyType = WidgetToUiMessageBody[typeof typ];
      const body: bodyType = data?.pluginMessage?.body as bodyType;
      currentNodeState = body.nodeState;
      // populate widget state in the UI.
      velocityX.value = currentNodeState.velocityX.toString();
      velocityY.value = currentNodeState.velocityY.toString();
      console.log("set current node state");
      break;
    default:
      break;
  }
});

if (submitButton) {
  submitButton.onclick = () => {
    console.log("submit click");
    const velocityX = (document.getElementById("velocityX") as HTMLInputElement)
      .valueAsNumber;
    const velocityY = (document.getElementById("velocityY") as HTMLInputElement)
      .valueAsNumber;
    const message = {
      pluginMessage: {
        type: "nodeUpdate",
        nodeId: currentNodeState?.id,
        velocityX: velocityX,
        velocityY: velocityY,
        nodeVersion: "",
      },
    };
    parent.postMessage(message, "*");



  };
}
