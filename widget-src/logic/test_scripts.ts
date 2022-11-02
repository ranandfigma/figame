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
