// This is a counter widget with buttons to increment and decrement the number.

import nodeAdd from "./assets/svg/node-add";
import { executeScript, ScriptBlock, TriggerEventType } from "./logic/script";
import playButton from "./assets/svg/play-button";
import editPanelHtml from "./embedded_ui/dist/edit_panel/index.html";
import playPanelHtml from "./embedded_ui/dist/play_panel/index.html";
import scriptPanelHtml from "./embedded_ui/dist/script_panel/index.html";
import { WidgetToUiMessageType } from "./messages";
import { defaultNodeState, NodeState } from "./node";
import { FPS } from "./consts";
import { Script } from "./logic/script";
import { TestScript } from "./logic/test_scripts";
import plus_symbol from "./assets/svg/plus_symbol";
import { initFunctionMap } from "./logic/functions";
import { AxisAlignedGameRectangle } from "./rectangle";

const { widget } = figma;
const { AutoLayout, SVG, useEffect, useSyncedMap, useSyncedState } = widget;

function Plus({
  nodeToScripts: nodeIdToScripts
}: {
  nodeToScripts: SyncedMap<Script[]>
}): SVG {
  return <SVG
      src={plus_symbol}
      width={50} height={50}
      onClick={() => {
        return new Promise((resolve) => {
          // Currently opens script panel but doesn't do anything with it.
          // Promise only really adds a test script for the selected node
          figma.showUI(scriptPanelHtml); 
          const currSelection = figma.currentPage.selection
          if (currSelection.length < 1) {
            console.log("Nothing selected to add script to")
          }
          else if (currSelection.length > 1) {
            console.log("More than 1 item selected")
          }
          else {
            const node = currSelection[0]
            console.log("Adding to node", node.id)
            if (!nodeIdToScripts.get(node.id)) {
              console.log("Adding upTestScript for node", node.id)
              nodeIdToScripts.set(node.id, [new TestScript(node.id)])
            }
          }
        })
      }}/>
}

function Widget() {
  initFunctionMap()
  const nodeStateById = useSyncedMap<NodeState>("nodeState");
  const [movableShapes, setMovableShapes] = useSyncedState<string[]>('movableShape', []);
  const nodeIdToScripts = useSyncedMap<Script[]>('nodeIdToScripts')

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
            collisionProps: {
                canCollide: true,
                static: false,
            }
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

          if (nodeState.collisionProps?.canCollide) {
              // turn a different color depending on the CollisionState.
              // do a pairwise comparison against every other node to see if we are in collision.
              const nodeRect = AxisAlignedGameRectangle.fromFrameNode(node);

              const prevState = nodeStateById.get(node.id);
              if (!prevState) {
                  console.error('no prev state');
                  return;
              }
              for (const [otherNodeId, nodeState] of nodeStateById.entries()) {
                  if (otherNodeId === nodeId) {
                      continue;
                  }

                  const otherNode = figma.getNodeById(otherNodeId)
                  if (otherNode?.type !== "FRAME") {
                      continue;
                  }

                const otherRect = AxisAlignedGameRectangle.fromFrameNode(otherNode);
                const inCollision = nodeRect.inCollision(otherRect);

                if (!inCollision) {
                    continue;
                }

                let velocityX_new = prevState.velocityX;
                let velocityY_new = prevState.velocityY;
                switch (otherNode.name) {
                    case 'Top':
                    case 'Bottom':
                        velocityY_new = -velocityY_new;
                        break;
                    case 'Right':
                    case 'Left':
                        velocityX_new = -velocityX_new;
                        break;
                }

                nodeStateById.set(node.id, {
                        ...prevState,
                        velocityX: velocityX_new,
                        velocityY: velocityY_new,
                        });
              }
          }
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
      <Plus nodeToScripts={nodeIdToScripts}/>
      <SVG src={playButton} width={50} height={50}
      onClick={() => {
          nodeIdToScripts.entries().forEach((entry) => {
            const nodeId = entry[0]
            const scripts = entry[1]
            scripts.forEach(script => {
              if (script.triggers.includes(TriggerEventType.FrameUpdate)) {
                executeScript(script)
              }
            })
          });
      }}/>
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
