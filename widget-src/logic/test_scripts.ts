import { Script, ScriptBlock, TriggerEventType } from "./script";

const horizontalMoveBlock = new ScriptBlock({
    onExecute: "figma.getNodeById(nodeId).x += args['amount']",
    args: {"amount": 5},
    displayName: "Move horizontally",
    displayColor: "#FFFFFF"
})

const verticalMoveBlock = new ScriptBlock({
    onExecute: "figma.getNodeById(nodeId).y += args['amount']",
    args: {"amount": 10},
    displayName: "Move vertically",
    displayColor: "#FFFFFF"
})

const logBlock = new ScriptBlock({
    onExecute: "console.log(args['value'])",
    args: {"value": "test2"},
    displayName: "Move vertically",
    displayColor: "#FFFFFF"
})

export class TestScript extends Script {
    constructor(nodeId: string) {
        super({
            blocks: [
                horizontalMoveBlock,
                verticalMoveBlock,
                logBlock
            ],
            triggers: [TriggerEventType.FrameUpdate],
            aliases: new Map(),
            variables: {}
        })
        this.nodeId = nodeId
    }
}
