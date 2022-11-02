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

export const defaultNodeState = (id: string): NodeState => {
  return {
    id,
    version: 0,
    velocityX: 0,
    velocityY: 0,
  };
};
