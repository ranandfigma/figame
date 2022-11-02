export interface CollisionProperties {
    canCollide: boolean; // should this object be considered a collideable.
    static: boolean;
}

export interface NodeState {
  id: string;
  version: number;
  velocityX: number;
  velocityY: number;
  collisionProps?: CollisionProperties;
}



// TODO: nested object updates.
export enum StateKey {
    velocityX = 'velocityX',
    velocityY = 'velocityY',
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
  };
};


// Ideally the custom scripts only have access to the abstracted "GameNode" and
// "World" classes, and don't have to make any direct figma calls.
export class GameNode {
    public readonly nodeState: NodeState;
    private nodeStateUpdates: NodeStateUpdate[];
    constructor(public readonly id: string, public readonly name: string, nodeState: NodeState) {
        this.nodeStateUpdates = [];
        this.nodeState = nodeState;
    }

    updateNodeState(update: NodeStateUpdate) {
        this.nodeStateUpdates.push(update);
    }

    getNodeUpdates() {
        return this.nodeStateUpdates;
    }

    clearNodeUpdates() {
        this.nodeStateUpdates = [];
    }

    applyNodeUpdates(nodeStateById: SyncedMap<NodeState>, _figma: typeof figma) {
        throw new Error('unimplemented');
    }
}


