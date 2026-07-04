export interface ActionResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface Action<TPayload = any> {
  type: string;
  execute(payload: TPayload): Promise<ActionResult>;
}
