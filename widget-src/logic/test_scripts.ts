import { FunctionName } from "./functions";
import { Script, ScriptBlock, TriggerEventType } from "./script";

const horizontalMoveBlock = new ScriptBlock({
    onExecute: FunctionName.MoveHorizontal,
    args: {"delta": 100}
})

const verticalMoveBlock = new ScriptBlock({
    onExecute: FunctionName.MoveVertical,
    args: {"delta": -100}
})

const logBlock = new ScriptBlock({
    onExecute: FunctionName.Debug,
    args: {},
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
