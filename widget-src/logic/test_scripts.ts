import { FunctionName } from "./functions";
import { ConditionBlock, Script, ScriptBlock, TriggerEvent, TriggerEventType } from "./script";

const horizontalMoveBlock = new ScriptBlock({
    color: "#FFFFFF",
    text: "Move horizontal",
    onExecute: FunctionName.MoveHorizontal,
    args: {"delta": 5}
})

const verticalMoveBlock = new ScriptBlock({
    color: "#FFFFFF",
    text: "Move vertical",
    onExecute: FunctionName.MoveVertical,
    args: {"delta": -5}
})

const logBlock = new ScriptBlock({
    color: "#FFFFFF",
    text: "Log",
    onExecute: FunctionName.Debug,
    args: {},
})

export const testConditionBlock = new ConditionBlock({
    condition: `
        (nodeId, context) => {
            return figma.getNodeById(nodeId).x > 60;
        }
    `,
    ifBlock: logBlock,
    elseBlock: verticalMoveBlock
})

const customInitializeBlock = new ScriptBlock({
    onExecute: FunctionName.Custom,
    color: '#FFFFFF',
    text: 'Custom',
    args: {
        js: `
            (nodeId, context) => {
                // One of the drawbacks of the current scripting setup is lack of a cohesive dev story here (libraries, common files etc.).
                
                const world = context.world;
                function getRandomInt(min, max) {
                  min = Math.ceil(min);
                  max = Math.floor(max);
                  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
                }
                const score = world.getNode('Scoreboard');
                const score2 = world.getNode('Scoreboard2');
                score.updateNodeState({
                    key: 'text',
                    value: 0,
                });
                score2.updateNodeState({
                    key: 'text',
                    value: 0,
                });
                const ball = world.getNode('Ball');
                ball.updateNodeState({
                    key: 'velocityX',
                    value: getRandomInt(50, 150),
                });
                ball.updateNodeState({
                    key: 'velocityY',
                    value: getRandomInt(50, 150),
                });
                const gameFrame = world.getNode('GameFrame');
                gameFrame.updateNodeState({
                    key: 'focus',
                    value: true,
                });
            }
        `,
    },
});

const customBlock = new ScriptBlock({
    color: "#FFFFFF",
    text: "Custom",
    onExecute: FunctionName.Custom,
    args: {
        js: `
            (nodeId, context) => {
                const otherNodeId = context.collisionContext?.otherNodeId;
                const otherNode = figma.getNodeById(otherNodeId);
                const gameNode = context.gameNode;
                const world = context.world;
                const score = world.getNode('Scoreboard');
                switch (otherNode.name) {
                    case 'Top':
                    case 'Bottom':
                        gameNode.updateNodeState({
                            key: 'velocityY',
                            value: -gameNode.nodeState.velocityY,
                        });
                        break;
                    case 'P1_Paddle':
                    case 'P2_Paddle':
                        gameNode.updateNodeState({
                            key: 'velocityX',
                            value: -gameNode.nodeState.velocityX,
                        });
                        break;
                    case 'Right':
                        score.updateNodeState({
                            key: 'text',
                            value: (Number(score.nodeState.text) + 1),
                        });
                        gameNode.updateNodeState({
                            key: 'velocityX',
                            value: -gameNode.nodeState.velocityX,
                        });
                        break;
                    case 'Left':
                        score2.updateNodeState({
                            key: 'text',
                            value: (Number(score2.nodeState.text) + 1),
                        });
                        gameNode.updateNodeState({
                            key: 'velocityX',
                            value: -gameNode.nodeState.velocityX,
                        });
                        break;
                }
            }
        `,
    }
});

const scoreBlock = new ScriptBlock({
    color: "#FFFFFF",
    text: "Custom",
    onExecute: FunctionName.Custom,
    args: {
        js: `
            (nodeId, context) => {
                const world = context.world;
                const score = context.gameNode;
                const winScreen = world.getNode('WinScreen');
                if (Number(score.nodeState.text) >= 5) {
                    winScreen.updateNodeState({
                        key: 'textOpacity',
                        value: 1
                    });
                }
            }
        `,
    }
});

export class TestScript extends Script {
    constructor(nodeId: string) {
        super({
            nodeId: nodeId,
            blocks: [
                horizontalMoveBlock,
                verticalMoveBlock,
                logBlock
            ],
            triggers: [
                new TriggerEvent({type: TriggerEventType.FrameUpdate})
            ],
            aliases: new Map(),
            variables: {}
        })
    }
}


export class CollisionScript extends Script {
    constructor(nodeId: string) {
        super({
            nodeId: nodeId,
            blocks: [
                customBlock,
            ],
            triggers: [
                new TriggerEvent({type: TriggerEventType.OnCollision})
            ],
            aliases: new Map(),
            variables: {},
        })
    }
}

export class InitializeScript extends Script {
    constructor(nodeId: string) { 
        super({
            nodeId: nodeId,
            blocks: [
                customInitializeBlock,
            ],
            triggers: [
                new TriggerEvent({type: TriggerEventType.GameStart})
            ],
            aliases: new Map(),
            variables: {},
        })
    }
}
