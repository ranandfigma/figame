export enum TriggerEventType {
    FrameUpdate,
    OnCollision,
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
    public onExecute: string
    public args: object
    private targetNodeIdMap: Map<string, string[]>
    private displayName: string
    private displayColor: string

    constructor({
        onExecute,
        args,
        displayName,
        displayColor
    }: {
        onExecute: string,
        args: object
        displayName: string,
        displayColor: string
    }) {
        this.onExecute = onExecute
        this.args = args
        this.targetNodeIdMap = new Map()
        this.displayName = displayName
        this.displayColor = displayColor
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
    script.blocks.forEach(block => new Function("nodeId", "args", block.onExecute)(script.nodeId, block.args))
}