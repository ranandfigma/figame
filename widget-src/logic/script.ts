import { Context, FunctionName, functionNameToImplMap } from "./functions"

export enum BlockType {
    ConditionBlock,
    ScriptBlock
}

export enum TriggerEventType {
    FrameUpdate = 'frame-update',
    GameStart = 'game-start',
    OnCollision = 'on-collision',
    KeyDown = 'key-down',
    KeyUp = 'key-up',
    Custom = 'custom'
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
    public type: BlockType;
    public color: string;
    public text: string;

    constructor({
        type,
        color,
        text
    }: {
        type: BlockType,
        color: string,
        text: string
    }) {
        this.type = type
        this.color = color
        this.text = text
    }
}

export class ConditionBlock extends Block {
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
            type: BlockType.ConditionBlock,
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
            type: BlockType.ScriptBlock,
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
    public nodeId: string
    public blocks: ScriptBlock[]
    public triggers: TriggerEvent[]
    private aliases: Map<string, string>
    private variables: object
    public name: string;

    constructor({
        nodeId,
        blocks,
        triggers,
        aliases,
        variables,
        name
    }: {
        nodeId: string
        blocks: ScriptBlock[]
        triggers: TriggerEvent[]
        aliases: Map<string, string>
        variables: object
        name: string
    }) {
        this.nodeId = nodeId
        this.blocks = blocks
        this.triggers = triggers
        this.aliases = aliases
        this.variables = variables
        this.name = name
    }
}

export function executeScript(script: Script, context?: Context) {
    script.blocks.forEach(block => {
        executeBlock(block, script.nodeId, context)
    })
}

export function executeBlock(block: Block, nodeId?: string, context?: Context) {
    if (block.type === BlockType.ConditionBlock) {
        const conditionBlock = block as ConditionBlock;
        if ((0, eval)(conditionBlock.condition)(nodeId, context)) {
            executeBlock(conditionBlock.ifBlock, nodeId, context);
        } else if (conditionBlock.elseBlock) {
            executeBlock(conditionBlock.elseBlock, nodeId, context);
        }
    }

    if (block.type === BlockType.ScriptBlock) {
        const scriptBlock = block as ScriptBlock;
        if (scriptBlock.onExecute === FunctionName.Custom) {
            const fn = (0, eval)(scriptBlock.args.js);
            fn(nodeId, context);
        } else if (functionNameToImplMap.has(scriptBlock.onExecute)) {
            functionNameToImplMap.get(scriptBlock.onExecute)!(scriptBlock.args, nodeId, context);
        }  
    }
}
