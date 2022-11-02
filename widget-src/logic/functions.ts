import { GameNode } from "../node";

export type Context = {
    gameNode: GameNode;
    collisionContext?: {
        otherNodeId: string;
    }
}

export const functionNameToImplMap = new Map<
    FunctionName,
    (args: any, nodeId?: string, context?: Context, ) => void
>()

export enum FunctionName {
    MoveHorizontal = 'move-horizontal',
    MoveVertical = 'move-vertical',
    SetVelocity = 'set-velocity',
    Custom = 'custom', // write your own javascript code.
    Debug = 'debug'
}

export const initFunctionMap = () => {
    functionNameToImplMap.set(
        FunctionName.MoveHorizontal,
        (args: any, nodeId: string = '') => {
            const delta = args['delta'] || 0

            if (figma && figma.getNodeById(nodeId) && (figma.getNodeById(nodeId) as unknown as any).x) {
                (figma.getNodeById(nodeId) as unknown as any).x += delta
            }
        }
    )

    functionNameToImplMap.set(
        FunctionName.MoveVertical,
        (args: any, nodeId: string = '') => {
            const delta = args['delta'] || 0

            if (figma && figma.getNodeById(nodeId) && (figma.getNodeById(nodeId) as unknown as any).x) {
                (figma.getNodeById(nodeId) as unknown as any).y += delta
            }
        }
    )

    functionNameToImplMap.set(
        FunctionName.Debug,
        (_: any, nodeId: string = '') => {
            if (figma && figma.getNodeById(nodeId)) {
                console.log({currentNode: figma.getNodeById(nodeId)})
            } else {
                console.log(`trying to print out node information for nodeId ${nodeId}, but none was found!`)
            }
        }
    )
}
