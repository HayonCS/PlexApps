export type ValueOf<T> = T[keyof T];

export type ActionType<TActions extends { [k: string]: any }> = ReturnType<ValueOf<TActions>>;

export type MessageType<TMessages extends { [k: string]: any }> = ReturnType<ValueOf<TMessages>>;
