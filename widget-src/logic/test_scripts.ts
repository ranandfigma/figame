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

const customBlock = new ScriptBlock({
    color: "#FFFFFF",
    text: "Custom",
    onExecute: FunctionName.Custom,
    args: {
        js: `
            (nodeId, context) => {
                console.log('collision handler');
                const otherNodeId = context.collisionContext.otherNodeId;
                const otherNode = figma.getNodeById(otherNodeId);
                const gameNode = context.gameNode;
                switch (otherNode.name) {
                    case 'Top':
                    case 'Bottom':
                        gameNode.updateNodeState({
                            key: 'velocityY',
                            value: -gameNode.nodeState.velocityY,
                        });
                        break;
                    case 'Right':
                    case 'Left':
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

export class TestScript extends Script {
    constructor(nodeId: string) {
        super({
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
        this.nodeId = nodeId
    }
}

export class CollisionScript extends Script {
    constructor(nodeId: string) {
        super({
            blocks: [
                customBlock,
            ],
            triggers: [ 
                new TriggerEvent({type: TriggerEventType.OnCollision})
            ],
            aliases: new Map(),
            variables: {},
        })
        this.nodeId = nodeId;
    }
}
