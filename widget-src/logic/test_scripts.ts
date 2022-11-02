import { FunctionName } from "./functions";
import { Script, ScriptBlock, TriggerEvent, TriggerEventType } from "./script";

const horizontalMoveBlock = new ScriptBlock({
    onExecute: FunctionName.MoveHorizontal,
    args: {"delta": 5}
})

const verticalMoveBlock = new ScriptBlock({
    onExecute: FunctionName.MoveVertical,
    args: {"delta": -5}
})

const logBlock = new ScriptBlock({
    onExecute: FunctionName.Debug,
    args: {},
})

const customBlock = new ScriptBlock({
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
            triggers: [TriggerEventType.OnCollision],
            aliases: new Map(),
            variables: {},
        })
        this.nodeId = nodeId;
    }
}
