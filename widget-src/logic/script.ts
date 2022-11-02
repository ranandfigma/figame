import { FunctionName, functionNameToImplMap } from "./functions"

export enum TriggerEventType {
    FrameUpdate,
    OnCollision,
    KeyDown,
    KeyUp,
    Custom
}

export class TriggerEvent {
    private type: TriggerEventType
    private name: string
    private value: object

    constructor({
        type,
        name,
        value
    }: {
        type: TriggerEventType,
        name: string,
        value: object
    }) {
        this.type = type
        this.name = name
        this.value = value
    }
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
    public nodeId?: string
    public blocks: ScriptBlock[]
    public triggers: TriggerEventType[]
    private aliases: Map<string, string>
    private variables: object

    constructor({
        nodeId,
        blocks,
        triggers,
        aliases,
        variables
    }: {
        nodeId?: string
        blocks: ScriptBlock[]
        triggers: TriggerEventType[]
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