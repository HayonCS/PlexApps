export class StorybookWorker implements Worker {
  private static instance: StorybookWorker;

  private constructor() {
    this.onerror = () => {};
    this.onmessageerror = () => {
      return undefined;
    };
    this.onmessage = () => {};
    this.postMessage = () => {};
  }
  onmessage: ((this: Worker, ev: any) => any) | null;
  postMessage(): void {}
  onmessageerror: ((this: Worker, ev: any) => any) | null;
  terminate(): void {}
  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean {
    return true;
  }
  onerror: ((this: AbstractWorker, ev: ErrorEvent) => any) | null;

  public static getInstance(): StorybookWorker {
    if (!StorybookWorker.instance) {
      StorybookWorker.instance = new StorybookWorker();
    }
    return StorybookWorker.instance;
  }
}
