import { Script, ScriptBlock, TriggerEventType } from "./script";

const verticalMoveBlock = new ScriptBlock({
    onExecute: (node: FrameNode) => node.y += 5,
    displayName: "Move vertically",
    displayColor: "#FFFFFF"
})

export const upTestScript = new Script({
    blocks: [
        verticalMoveBlock
    ],
    triggers: [TriggerEventType.FrameUpdate],
    aliases: new Map(),
    variables: new Map()
})
