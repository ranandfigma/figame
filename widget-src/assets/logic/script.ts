export enum TriggerEventType {
    FrameUpdate,
    OnCollision,
    Custom
}

export class TriggerEvent {
    private type: TriggerEventType
    private name: string
    private value: any

    constructor({
        type,
        name,
        value
    }: {
        type: TriggerEventType,
        name: string,
        value: any
    }) {
        this.type = type
        this.name = name
        this.value = value
    }
}

export class ScriptBlock {
    private onExecute: Function
    private targetNodeIdMap: Map<string, string[]>
    private displayName: string
    private displayColor: string

    constructor({
        onExecute,
        displayName,
        displayColor
    }: {
        onExecute: Function,
        displayName: string,
        displayColor: string
    }) {
        this.onExecute = onExecute
        this.targetNodeIdMap = new Map()
        this.displayName = displayName
        this.displayColor = displayColor
    }

    public addTargetNodeId(alias: string, nodeIds: string[]) {
       this.targetNodeIdMap.set(alias, nodeIds) 
    }
}

export class Script {
    private blocks: ScriptBlock[]
    private triggers: TriggerEventType[]
    private aliases: Map<string, string>
    private variables: Map<string, string>

    constructor({
        blocks,
        triggers,
        aliases,
        variables
    }: {
        blocks: ScriptBlock[]
        triggers: TriggerEventType[]
        aliases: Map<string, string>
        variables: Map<string, string>
    }) {
        this.blocks = blocks
        this.triggers = triggers
        this.aliases = aliases
        this.variables = variables
    }
}