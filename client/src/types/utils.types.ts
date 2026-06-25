export type eventType = "click" | "input";

export type Page<T> = {
  total: number;
  items: T[];
};
