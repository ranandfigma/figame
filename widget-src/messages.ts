import { NodeState } from "./node";

// Widget to UI messages.
export enum WidgetToUiMessageType {
  NodeState = "NodeState",
  a = "a",
}

export type WidgetToUiMessageBody = {
  [K in WidgetToUiMessageType]: {
    [WidgetToUiMessageType.NodeState]: {
      nodeState: NodeState;
    };
    [WidgetToUiMessageType.a]: {};
  }[K];
};

export type WidgetToUiMessage<T extends WidgetToUiMessageType> = {
  pluginMessage: {
    type: T;
    body: WidgetToUiMessageBody[T];
  };
};

// UI to widget messages.
export enum UiToWidgetMessageType {
  WidgetStateUpdate = "WidgetStateUpdate",
}

export type UiToWidgetMessageBody = {
  [K in UiToWidgetMessageType]: {
    [UiToWidgetMessageType.WidgetStateUpdate]: {};
  }[K];
};

export type UiToWidgetMessage<T extends UiToWidgetMessageType> = {
  pluginMessage: {
    type: T;
    body: UiToWidgetMessageBody[T];
  };
};
