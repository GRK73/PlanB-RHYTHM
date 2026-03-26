export enum InputType {
  KEYBOARD_LOWER = 'KEYBOARD_LOWER',
  MOUSE_UPPER = 'MOUSE_UPPER',
  WHEEL_UP = 'WHEEL_UP',
  WHEEL_DOWN = 'WHEEL_DOWN',
}

export type InputCallback = (type: InputType) => void;

export class InputManager {
  private static instance: InputManager;
  private callbacks: InputCallback[] = [];
  private lastWheelTime: number = 0;
  private readonly WHEEL_DEBOUNCE = 100; // ms

  private constructor() {}

  public static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  public init(container: HTMLElement) {
    // Keyboard listener
    window.addEventListener('keydown', this.handleKeyDown);
    
    // Mouse click listener
    container.addEventListener('mousedown', this.handleMouseDown);
    
    // Mouse wheel listener
    container.addEventListener('wheel', this.handleWheel, { passive: false });
  }

  public onInput(callback: InputCallback) {
    this.callbacks.push(callback);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === 'f' || e.key.toLowerCase() === 'j') {
      this.trigger(InputType.KEYBOARD_LOWER);
    }
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0 || e.button === 2) {
      this.trigger(InputType.MOUSE_UPPER);
    }
  };

  private handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    
    const now = performance.now();
    if (now - this.lastWheelTime < this.WHEEL_DEBOUNCE) return;
    
    if (e.deltaY < 0) {
      this.trigger(InputType.WHEEL_UP);
    } else if (e.deltaY > 0) {
      this.trigger(InputType.WHEEL_DOWN);
    }
    
    this.lastWheelTime = now;
  };

  private trigger(type: InputType) {
    this.callbacks.forEach(cb => cb(type));
  }

  public destroy(container: HTMLElement) {
    window.removeEventListener('keydown', this.handleKeyDown);
    container.removeEventListener('mousedown', this.handleMouseDown);
    container.removeEventListener('wheel', this.handleWheel);
    this.callbacks = [];
  }
}
