import { Context, FunctionName, functionNameToImplMap } from "./functions"

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

export class Block {
    public color: string;
    public text: string;

    constructor({
        color,
        text
    }: {
        color: string,
        text: string
    }) {
        this.color = color
        this.text = text
    }
}

export class IfBlock extends Block {
    public condition: string
    public ifBlock: Block
    public elseBlock?: Block

    constructor({
        condition,
        ifBlock,
        elseBlock
    }: {
        condition: string
        ifBlock: Block
        elseBlock?: Block
    }) {
        super({
            color: '#fffff', 
            text: "if"
        })

        this.condition = condition
        this.ifBlock = ifBlock
        this.elseBlock = elseBlock
    }
}

export class ScriptBlock extends Block {
    public onExecute: FunctionName
    public args: any;
    private targetNodeIdMap: Map<string, string[]>

    constructor({
        onExecute,
        args,
        color,
        text
    }: {
        onExecute: FunctionName,
        args: object,
        color: string,
        text: string
    }) {
        super({
            color: color,
            text: text
        })

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
    public blocks: Block[]
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
        nodeId?: string
        blocks: Block[]
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

export function executeScript(script: Script, context?: Context) {
    script.blocks.forEach(block => {
        executeBlock(block, script.nodeId, context)
    })
}

export function executeBlock(block: Block, nodeId?: string, context?: Context) {
    if (block instanceof IfBlock) {
        if (eval(block.condition)) {
            executeBlock(block.ifBlock)
        } else if (block.elseBlock) {
            executeBlock(block.elseBlock)
        }
    }

    if (block instanceof ScriptBlock) {
        if (block.onExecute === FunctionName.Custom) {
            const fn = (0, eval)(block.args.js);
            fn(nodeId, context);
        } else if (functionNameToImplMap.has(block.onExecute)) {
            functionNameToImplMap.get(block.onExecute)!(block.args, nodeId, context);
        }  
    }
}
