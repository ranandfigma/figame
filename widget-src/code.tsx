// This is a counter widget with buttons to increment and decrement the number.

import nodeAdd from "./assets/svg/node-add";
import { doesTriggerMatch, executeScript, ScriptBlock, TriggerEvent, TriggerEventType } from "./logic/script";
import playButton from "./assets/svg/play-button";
import editPanelHtml from "./deprecated_ui/dist/edit_panel/index.html";
import playPanelHtml from "./deprecated_ui/dist/play_panel/index.html";
import scriptPanelHtml from "./iframe/dist/index.html"; //"./embedded_ui/dist/script_panel/index.html";
import { WidgetToUiMessageType } from "./messages";
import { defaultNodeState, GameNode, NodeState, World } from "./node";
import { FPS } from "./consts";
import { Script } from "./logic/script";
import { CollisionScript, InitializeScript, testConditionBlock, TestScript } from "./logic/test_scripts";
import plus_symbol from "./assets/svg/plus_symbol";
import pause from "./assets/svg/pause";
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
      onClick={async () => {

        return new Promise((resolve) => {
          // Currently opens script panel but doesn't do anything with it.
          // Promise only really adds a test script for the selected node
          figma.showUI(__html__, {
            width: 640,
            height: 600
          }); 
          const currSelection = figma.currentPage.selection
          if (currSelection.length < 1) {
            console.log("Nothing selected to add script to")
          }
          else if (currSelection.length > 1) {
            console.log("More than 1 item selected")
          }
          // else {
          //   const node = currSelection[0]
          //   console.log("Adding to node", node.id)
          //   if (!nodeIdToScripts.get(node.id)) {
          //       nodeIdToScripts.delete(node.id);
          //   }
          //     console.log("Adding scripts for node", node.id)

          //     const registerScriptForNodeId = (script: Script, nodeId: string) => {
          //       if (nodeIdToScripts.has(nodeId)) {
          //         nodeIdToScripts.set(node.id, [...nodeIdToScripts.get(node.id)!, script])
          //       } else {
          //         nodeIdToScripts.set(node.id, [script])
          //       }
          //     }

          //     const arrowDownCondition = ['ArrowDown']
          //     const arrowDownScript = new Script({
          //       nodeId: node.id,
          //       triggers: [new TriggerEvent({
          //         type: TriggerEventType.KeyDown,
          //         conditions: arrowDownCondition
          //       })],
          //       blocks: [
          //         new ScriptBlock({
          //           onExecute: FunctionName.MoveVertical,
          //           args: {'delta': 10},
          //           color: "#FFFFFF",
          //           text: "testMoveVertical"
          //         })
          //       ],
          //       aliases: new Map(),
          //       variables: {}
          //     })


          //     const arrowUpCondition = ['ArrowUp']
          //     const arrowUpScript = new Script({
          //       nodeId: node.id,
          //       triggers: [new TriggerEvent({
          //         type: TriggerEventType.KeyDown,
          //         conditions: arrowUpCondition
          //       })],
          //       blocks: [
          //         new ScriptBlock({
          //           onExecute: FunctionName.MoveVertical,
          //           args: {'delta': -10},
          //           color: "#FFFFFF",
          //           text: "testMoveVertical"
          //         })
          //       ],
          //       aliases: new Map(),
          //       variables: {}
          //     })

          //     const arrowLeftCondition = ['ArrowLeft']
          //     const arrowLeftScript = new Script({
          //       nodeId: node.id,
          //       triggers: [new TriggerEvent({
          //         type: TriggerEventType.KeyDown,
          //         conditions: arrowLeftCondition
          //       })],
          //       blocks: [
          //         new ScriptBlock({
          //           onExecute: FunctionName.MoveHorizontal,
          //           args: {'delta': -10},
          //           color: "#FFFFFF",
          //           text: "testMoveHorizontal"
          //         })
          //       ],
          //       aliases: new Map(),
          //       variables: {}
          //     })

          //     const arrowRightCondition = ['ArrowRight']
          //     const arrowRightScript = new Script({
          //       nodeId: node.id,
          //       triggers: [new TriggerEvent({
          //         type: TriggerEventType.KeyDown,
          //         conditions: arrowRightCondition
          //       })],
          //       blocks: [
          //         testConditionBlock,
          //         new ScriptBlock({
          //           onExecute: FunctionName.MoveHorizontal,
          //           args: {'delta': 10},
          //           color: "#FFFFFF",
          //           text: "testMoveHorizontal"
          //         })
          //       ],
          //       aliases: new Map(),
          //       variables: {}
          //     })

          //     registerScriptForNodeId(arrowDownScript, node.id)
          //     registerScriptForNodeId(arrowUpScript, node.id)
          //     registerScriptForNodeId(arrowLeftScript, node.id)
          //     registerScriptForNodeId(arrowRightScript, node.id)
          //     registerScriptForNodeId(new CollisionScript(node.id), node.id);
          //     registerScriptForNodeId(new InitializeScript(node.id), node.id);
          // }
        })
      }}/>
}

interface UIScriptBlock {
  functionName: string;
  args: any 
}

function Widget() {
  initFunctionMap()
  const nodeStateById = useSyncedMap<NodeState>("nodeState");
  const nodeIdToScripts = useSyncedMap<Script[]>('nodeIdToScripts')
  const world = new World(figma, nodeStateById, []);

  console.log('render widget')

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

    const registerScriptForNodeId = (script: Script, nodeId: string) => {
      if (nodeIdToScripts.has(nodeId)) {
        nodeIdToScripts.set(nodeId, [...nodeIdToScripts.get(nodeId)!, script])
      } else {
        nodeIdToScripts.set(nodeId, [script])
      }
    }

    const removeScriptsForNodeId = (nodeId: string) => {
      nodeIdToScripts.delete(nodeId)
    }

    console.log('setting up message handler')

    figma.ui.onmessage = (message) => {
      if (message.type === 'get-node') {
        let node;
        const currSelection = figma.currentPage.selection
        if (currSelection.length < 1) {
          // console.log("Nothing selected to add script to")
        }
        else if (currSelection.length > 1) {
          // console.log("More than 1 item selected")
        } else {
          node = currSelection[0]
        }

        if (node) {
          figma.ui.postMessage({
            type: 'node-info',
            scripts: nodeIdToScripts.get(node.id),
            isNodeSelected: node !== undefined
          })
        }
      }
      if (message.type === 'scriptAssign') {
        console.log('got scriptassign message')

        let node;
        const currSelection = figma.currentPage.selection
        if (currSelection.length < 1) {
          console.log("Nothing selected to add script to")
        }
        else if (currSelection.length > 1) {
          console.log("More than 1 item selected")
        } else {
          node = currSelection[0]
        }

        if (node) {
          console.log('received script', {message})

          const uiScriptBlocks: UIScriptBlock[] = JSON.parse(message.scriptBlocks)
          const scriptBlocks: ScriptBlock[] = []
          for (const block of uiScriptBlocks) {
            scriptBlocks.push(new ScriptBlock({
              onExecute: block.functionName as FunctionName,
              args: block.args,
              color: '#FFFFFF',
              text: '',
            }))
          }
          
          let conditions: string[] | undefined;
          if (message.keyCode) {
            conditions = [message.keyCode]
          }

          registerScriptForNodeId(new Script({
            triggers: [new TriggerEvent({type: message.triggerEventType as TriggerEventType, conditions})],
            aliases: new Map,
            variables: [],
            blocks: scriptBlocks,
            nodeId: node.id,
            name: message.scriptName
          }), node.id)
        }
      }
      if (message.type === 'scriptRemove') {
        let node;
        const currSelection = figma.currentPage.selection
        if (currSelection.length < 1) {
          console.log("Nothing selected to add script to")
        }
        else if (currSelection.length > 1) {
          console.log("More than 1 item selected")
        } else {
          node = currSelection[0]
        }

        if (node) {
          removeScriptsForNodeId(node.id)
        }
      }
      if (message.type === "nodeUpdate") {
        let node;
        const currSelection = figma.currentPage.selection
        if (currSelection.length < 1) {
          console.log("Nothing selected to add script to")
        }
        else if (currSelection.length > 1) {
          console.log("More than 1 item selected")
        } else {
          node = currSelection[0]
        }

        const nodeType = node?.type;
        switch(nodeType) {
            case "FRAME":
                break;
            default: 
                console.error("invalid node type");
        }
        if (node?.type === "FRAME") {
          // TODO: handle deleted nodes, nodes edited by other users (only one user per node edit for now with version number tracking).
          const prevState = nodeStateById.get(node.id);
          console.log('setting canCollide to', message.canCollide)
          nodeStateById.set(node.id, {
            id: node.id,
            version: (prevState?.version || 0) + 1,
            velocityX: message.velocityX || 0,
            velocityY: message.velocityY || 0,
            collisionProps: {
                canCollide: message.canCollide,
                static: false,
            }
          });
        } else {
          console.error("not a frame");
        }
        // figma.closePlugin();
      } else if (message.type === "gameInit") {
          const gameInitScripts = nodeIdToScripts.entries().flatMap(([_, scripts]) => scripts).filter(script => script.triggers.find(trigger => trigger.type === TriggerEventType.GameStart))
          for (const script of gameInitScripts) {
              console.log(`Running game init script ${script.blocks}`);
              const nodeId = script.nodeId!;
              const node = figma.getNodeById(nodeId);
              if (!node) {
                  console.error(`no node with id ${nodeId}`);
                  continue;
              }

              const nodeState = nodeStateById.get(node.id) || defaultNodeState(node.id);
              const gameNode = new GameNode(node.id, node.name, nodeState, world);
              executeScript(script, {
                  gameNode,
                  world,
              })
          }
      } else if (message.type === "tick") {
        for (const [nodeId, nodeState] of nodeStateById.entries()) {
          const node = figma.getNodeById(nodeId);
          const scripts = nodeIdToScripts.get(nodeId);
          const collisionScripts = scripts?.filter((s) => s.triggers.find(t => t.type === TriggerEventType.OnCollision)) || [];
          if (node?.type !== "FRAME") {
            console.error("non frame object in nodes");
            return;
          }


          node.x += (nodeState.velocityX  || 0) / FPS;
          node.y += (nodeState.velocityY ||0 ) / FPS;

          if (nodeState.collisionProps?.canCollide && collisionScripts.length) {
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
                const gameNode = new GameNode(node.id, node.name, prevState, world);
                for (const collisionScript of collisionScripts) {
                    executeScript(collisionScript, {
                        gameNode,
                        world,
                        collisionContext: {
                            otherNodeId,
                        },
                    });
                }
              }
          }
        }

        runAllFrameTriggerScripts()
      } else if (message.type === "keydown") {
        runAllKeyDownScriptsForCode(message.keyCode)
      } else if (message.type === "keyup") {
      }
      world.applyPendingUpdates();
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
      {/*
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

            figma.showUI(__html__, {
              width: 640,
              height: 480
            });
            figma.ui.postMessage({
              type: WidgetToUiMessageType.NodeState,
              body: {
                nodeState,
              },
            });
          });
        }}
      />*/}
      <SVG
        src={playButton}
        width={50}
        height={50}
        onClick={async () => {


        // hardcode what fonts are available for now.
        console.log('loading fonts');
        await figma.loadFontAsync({
            family: "Inter", style: "Regular"
        });
          return new Promise((resolve) => {
            figma.showUI(__html__, {
              width: 640,
              height: 600
            });

            figma.ui.postMessage({
              type: 'play'
            });
          });
        }}
      />
      <SVG
        src={pause}
        width={50}
        height={50}
        onClick={async () => {


        // hardcode what fonts are available for now.
        console.log('loading fonts');
        await figma.loadFontAsync({
            family: "Inter", style: "Regular"
        });
          return new Promise((resolve) => {
            figma.showUI(__html__, {
              width: 640,
              height: 600
            });

            figma.ui.postMessage({
              type: 'stop'
            });
          });
        }}
      />
    </AutoLayout>
  );
}

widget.register(Widget);
