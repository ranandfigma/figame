// This is a counter widget with buttons to increment and decrement the number.

import nodeAdd from "./assets/svg/node-add";
import { ScriptBlock } from "./assets/logic/script";
import playButton from "./assets/svg/play-button";
import editPanelHtml from "./embedded_ui/dist/edit_panel/index.html";
import playPanelHtml from "./embedded_ui/dist/play_panel/index.html";
import { WidgetToUiMessageType } from "./messages";
import { defaultNodeState, NodeState } from "./node";
import { FPS } from "./consts";

const { widget } = figma;
const { AutoLayout, SVG, useEffect, useSyncedMap } = widget;

function Widget() {
  const nodeStateById = useSyncedMap<NodeState>("nodeState");

  useEffect(() => {
    figma.ui.onmessage = (message) => {
      console.log("message", message);
      if (message.type === "nodeUpdate") {
        const node = figma.getNodeById(message.nodeId);
        if (node?.type === "FRAME") {
          // TODO: handle deleted nodes, nodes edited by other users (only one user per node edit for now with version number tracking).
          const prevState = nodeStateById.get(node.id);
          nodeStateById.set(node.id, {
            id: node.id,
            version: (prevState?.version || 0) + 1,
            velocityX: message.velocityX,
            velocityY: message.velocityY,
          });
        } else {
          console.error("not a frame");
        }
        figma.closePlugin();
      } else if (message.type === "tick") {
        for (const [nodeId, nodeState] of nodeStateById.entries()) {
          const node = figma.getNodeById(nodeId);
          if (node?.type !== "FRAME") {
            console.error("non frame object in nodes");
            return;
          }
          node.x += nodeState.velocityX / FPS;
          node.y += nodeState.velocityY / FPS;
        }
      }
    };
  });

  return (
    <AutoLayout
      verticalAlignItems={"center"}
      spacing={8}
      padding={16}
      cornerRadius={8}
      fill={"#FFFFFF"}
      stroke={"#E6E6E6"}
    >
      <SVG src={playButton} width={50} height={50}
      onClick={() => {
          console.log('running script!')
      }}/>
      <SVG
        src={nodeAdd}
        width={50}
        height={50}
        onClick={() => {
          return new Promise((resolve) => {
            if (figma.currentPage.selection.length !== 1) {
              console.error("Select a single frame/ object to edit");
              return;
            }

            const node = figma.currentPage.selection[0];
            let nodeState = nodeStateById.get(node.id)!; // It may not exist for racey creates/ deletes, but assume it does for now.
            if (!nodeState) {
              console.log("setting node state", defaultNodeState(node.id));
              nodeState = defaultNodeState(node.id);
              console.log(node.id);
            }
            console.log("node state", nodeState);

            figma.showUI(editPanelHtml);
            figma.ui.postMessage({
              type: WidgetToUiMessageType.NodeState,
              body: {
                nodeState,
              },
            });
          });
        }}
      />
      <SVG
        src={playButton}
        width={50}
        height={50}
        onClick={() => {
          return new Promise((resolve) => {
            figma.showUI(playPanelHtml, {
              visible: false,
            });
          });
        }}
      />
    </AutoLayout>
  );
}

widget.register(Widget);
