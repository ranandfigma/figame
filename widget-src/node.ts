export interface NodeState {
  id: string;
  version: number;
  velocityX: number;
  velocityY: number;
}

export const defaultNodeState = (id: string): NodeState => {
  return {
    id,
    version: 0,
    velocityX: 0,
    velocityY: 0,
  };
};
