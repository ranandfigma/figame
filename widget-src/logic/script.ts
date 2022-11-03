import { FunctionName, functionNameToImplMap } from "./functions"

export enum TriggerEventType {
    FrameUpdate,
    OnCollision,
    KeyDown,
    KeyUp,
    Custom
}

export class TriggerEvent {
    public type: TriggerEventType
    public conditions: string[]

    constructor({
        type,
        conditions
    }: {
        type: TriggerEventType,
        conditions?: string[]
    }) {
        this.type = type
        this.conditions = conditions || []
    }
}

export const doesTriggerMatch = (trigger: TriggerEvent, type: TriggerEventType, conditions: string[] = []) => {
    if (type !== trigger.type) return false
    if (conditions.length !== trigger.conditions.length) {
        return false
    } else {
        for (let i = 0; i < trigger.conditions.length; i++) {
            if (!(conditions.includes(trigger.conditions[i]))) {
                return false
            }
        }
    }

    return true
}

export class ScriptBlock {
    public onExecute: FunctionName
    public args: object
    private targetNodeIdMap: Map<string, string[]>

    constructor({
        onExecute,
        args,
    }: {
        onExecute: FunctionName,
        args: object
    }) {
        this.onExecute = onExecute
        this.args = args
        this.targetNodeIdMap = new Map()
    }

    public addTargetNodeId(alias: string, nodeIds: string[]) {
       this.targetNodeIdMap.set(alias, nodeIds) 
    }
}

export class Script {
    public nodeId: string
    public blocks: ScriptBlock[]
    public triggers: TriggerEvent[]
    private aliases: Map<string, string>
    private variables: object

    constructor({
        nodeId,
        blocks,
        triggers,
        aliases,
        variables
    }: {
        nodeId: string
        blocks: ScriptBlock[]
        triggers: TriggerEvent[]
        aliases: Map<string, string>
        variables: object
    }) {
        this.nodeId = nodeId
        this.blocks = blocks
        this.triggers = triggers
        this.aliases = aliases
        this.variables = variables
    }
}

export function executeScript(script: Script) {
    script.blocks.forEach(block => {
        if (functionNameToImplMap.has(block.onExecute)) {
            functionNameToImplMap.get(block.onExecute)!(block.args, script.nodeId);
        }
    })
}
