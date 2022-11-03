export interface CollisionProperties {
    canCollide: boolean; // should this object be considered a collideable.
    static: boolean;
}

export interface NodeState {
  id: string;
  version: number;
  velocityX: number;
  velocityY: number;
  text?: string;
  collisionProps?: CollisionProperties;
}



// TODO: nested object updates.
export enum StateKey {
    velocityX = 'velocityX',
    velocityY = 'velocityY',
    text = 'text',
}

export interface NodeStateUpdate {
    key: StateKey;
    value: any;
}

export const defaultNodeState = (id: string): NodeState => {
  return {
    id,
    version: 0,
    velocityX: 0,
    velocityY: 0,
    text: '0',
  };
};


// Ideally the custom scripts only have access to the abstracted "GameNode" and
// "World" classes, and don't have to make any direct figma calls.
export class GameNode {
    public readonly nodeState: NodeState;
    private nodeStateUpdates: NodeStateUpdate[];
    private world: World;
    constructor(public readonly id: string, public readonly name: string, nodeState: NodeState, world: World) {
        this.nodeStateUpdates = [];
        this.nodeState = nodeState;
        this.world = world;
    }

    // this is a bad api, move it all to the world for tracking.
    updateNodeState(update: NodeStateUpdate) {
        this.nodeStateUpdates.push(update);
        this.world.markNodeForUpdate(this);
    }

    applyNodeUpdates(nodeStateById: SyncedMap<NodeState>, _figma: typeof figma) {
        console.log('applying updates', this.nodeStateUpdates);
        const prevState = nodeStateById.get(this.id) || defaultNodeState(this.id);
        for (const update of this.nodeStateUpdates) {
            switch (update.key) {
            case StateKey.text:
                // TODO: update text in figma if it is a text node.
                const node = _figma.getNodeById(this.id)
                if (node?.type !== "FRAME") {
                    console.error(`node ${this.id} not type frame`);
                    break; // out of switch.
                }

                // Find the first text node inside the frame (really bad way,
                // but can't see a better way to address a node, maybe we
                // should just use node ids everywhere).

                const textNode = node.findOne(n => n.type === "TEXT");
                if (!textNode) {
                    console.error(`node ${this.id} does not contain text`);
                    break; // out of switch.
                }
                (textNode as TextNode).characters = String(update.value);
                (prevState as any)[update.key] = update.value; // still update the state for later access.
                break;
            default:
                (prevState as any)[update.key] = update.value;
                break;
            }
        }

        nodeStateById.set(this.id, prevState);
        this.nodeStateUpdates = [];
    }
}



export class World {
    constructor(private figma_: typeof figma, private nodeStateById: SyncedMap<NodeState>, private nodesForUpdate: GameNode[]) {
    }

    getNode(name: string): GameNode {
        const figNode = this.figma_.currentPage.findOne(n => n.name === name);// TODO: optimize: https://www.figma.com/plugin-docs/api/properties/nodes-findone/
        if (!figNode) {
            throw new Error('no such node');
        }
        const nodeId = figNode.id;
        let nodeState = this.nodeStateById.get(nodeId) || defaultNodeState(nodeId);
        return new GameNode(nodeId, name, nodeState, this);
    }

    markNodeForUpdate(gameNode: GameNode) {
        this.nodesForUpdate.push(gameNode);
    }

    applyPendingUpdates() {
        for (const node of this.nodesForUpdate) {
            node.applyNodeUpdates(this.nodeStateById, this.figma_);
        }
        this.nodesForUpdate = [];
    }
}
