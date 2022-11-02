// This is a counter widget with buttons to increment and decrement the number.

import nodeAdd from "./assets/svg/node-add";
import { doesTriggerMatch, executeScript, ScriptBlock, TriggerEvent, TriggerEventType } from "./logic/script";
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
import { FunctionName, initFunctionMap } from "./logic/functions";
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
              // nodeIdToScripts.set(node.id, [new TestScript(node.id)])

              const registerScriptForNodeId = (script: Script, nodeId: string) => {
                if (nodeIdToScripts.has(nodeId)) {
                  nodeIdToScripts.set(node.id, [...nodeIdToScripts.get(node.id)!, script])
                } else {
                  nodeIdToScripts.set(node.id, [script])
                }
              }

              const arrowDownCondition = ['ArrowDown']
              const arrowDownScript = new Script({
                nodeId: node.id,
                triggers: [new TriggerEvent({
                  type: TriggerEventType.KeyDown,
                  conditions: arrowDownCondition
                })],
                blocks: [
                  new ScriptBlock({
                    onExecute: FunctionName.MoveVertical,
                    args: {'delta': 10}
                  })
                ],
                aliases: new Map(),
                variables: {}
              })


              const arrowUpCondition = ['ArrowUp']
              const arrowUpScript = new Script({
                nodeId: node.id,
                triggers: [new TriggerEvent({
                  type: TriggerEventType.KeyDown,
                  conditions: arrowUpCondition
                })],
                blocks: [
                  new ScriptBlock({
                    onExecute: FunctionName.MoveVertical,
                    args: {'delta': -10}
                  })
                ],
                aliases: new Map(),
                variables: {}
              })

              const arrowLeftCondition = ['ArrowLeft']
              const arrowLeftScript = new Script({
                nodeId: node.id,
                triggers: [new TriggerEvent({
                  type: TriggerEventType.KeyDown,
                  conditions: arrowLeftCondition
                })],
                blocks: [
                  new ScriptBlock({
                    onExecute: FunctionName.MoveHorizontal,
                    args: {'delta': -10}
                  })
                ],
                aliases: new Map(),
                variables: {}
              })

              const arrowRightCondition = ['ArrowRight']
              const arrowRightScript = new Script({
                nodeId: node.id,
                triggers: [new TriggerEvent({
                  type: TriggerEventType.KeyDown,
                  conditions: arrowRightCondition
                })],
                blocks: [
                  new ScriptBlock({
                    onExecute: FunctionName.MoveHorizontal,
                    args: {'delta': 10}
                  })
                ],
                aliases: new Map(),
                variables: {}
              })

              registerScriptForNodeId(arrowDownScript, node.id)
              registerScriptForNodeId(arrowUpScript, node.id)
              registerScriptForNodeId(arrowLeftScript, node.id)
              registerScriptForNodeId(arrowRightScript, node.id)
            }
          }
        })
      }}/>
}

function Widget() {
  initFunctionMap()
  const nodeStateById = useSyncedMap<NodeState>("nodeState");
  const nodeIdToScripts = useSyncedMap<Script[]>('nodeIdToScripts')

  useEffect(() => {
    const runAllFrameTriggerScripts = () => {
      nodeIdToScripts.entries().forEach((entry) => {
        const scripts = entry[1]
        scripts.forEach(script => {
          script.triggers.forEach((trigger: TriggerEvent) => {
            if (doesTriggerMatch(trigger, TriggerEventType.FrameUpdate)) {
              executeScript(script)
            }
          })
        })
      });
    }

    const runAllKeyDownScriptsForCode = (keyCode: string) => {
      const keyCodeCondition = [keyCode]

      nodeIdToScripts.entries().forEach((entry) => {
        const scripts = entry[1]
        scripts.forEach(script => {
          script.triggers.forEach((trigger) => {
            if (doesTriggerMatch(trigger, TriggerEventType.KeyDown, keyCodeCondition)) {
              executeScript(script)
            }
          })
        })
      });
    }

    figma.ui.onmessage = (message) => {
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
          const scripts = nodeIdToScripts.get(nodeId);
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

                scripts?.filter((s) => {
                  s.triggers.forEach((trigger) => {
                    if (doesTriggerMatch(trigger, TriggerEventType.OnCollision)) {
                      executeScript(s)
                    }
                  })
                });

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

        runAllFrameTriggerScripts()
      } else if (message.type === "keydown") {
        console.log('received keydown', {message})
        runAllKeyDownScriptsForCode(message.keyCode)
      } else if (message.type === "keyup") {
        console.log('received keyup', {message})
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
              // visible: false,
            });
          });
        }}
      />
    </AutoLayout>
  );
}

widget.register(Widget);
