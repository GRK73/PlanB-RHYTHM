export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (item: T) => void;

  constructor(createFn: () => T, resetFn: (item: T) => void, initialSize: number = 0) {
    this.createFn = createFn;
    this.resetFn = resetFn;

    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  public acquire(): T {
    const item = this.pool.pop() || this.createFn();
    return item;
  }

  public release(item: T): void {
    this.resetFn(item);
    this.pool.push(item);
  }

  public clear(): void {
    this.pool = [];
  }
}
