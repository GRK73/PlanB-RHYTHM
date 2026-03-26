import { InputManager, InputType } from '../core/InputManager';

export class CharacterManager {
  private roster: number[] = [0, 1, 2]; // Example IDs
  private currentIndex: number = 0;

  constructor() {
    InputManager.getInstance().onInput((type) => {
      if (type === InputType.WHEEL_UP) {
        this.switchPrevious();
      } else if (type === InputType.WHEEL_DOWN) {
        this.switchNext();
      }
    });
  }

  public setRoster(roster: number[]) {
    this.roster = roster;
    this.currentIndex = 0;
  }

  public getActiveCharacterId(): number {
    return this.roster[this.currentIndex];
  }

  public getActiveIndex(): number {
    return this.currentIndex;
  }

  public getRosterSize(): number {
    return this.roster.length;
  }

  private switchNext() {
    this.currentIndex = (this.currentIndex + 1) % this.roster.length;
    console.log(`Switched to Character ID: ${this.getActiveCharacterId()}`);
  }

  private switchPrevious() {
    this.currentIndex = (this.currentIndex - 1 + this.roster.length) % this.roster.length;
    console.log(`Switched to Character ID: ${this.getActiveCharacterId()}`);
  }
}
