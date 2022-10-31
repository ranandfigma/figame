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