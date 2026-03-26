import { InputManager, InputType } from '../core/InputManager';
import { AudioManager } from '../core/AudioManager';
import { CharacterManager } from './CharacterManager';
import { NoteData } from './ChartLoader';

export enum Judgment {
  PERFECT = 'PERFECT',
  GREAT = 'GREAT',
  GOOD = 'GOOD',
  MISS = 'MISS',
}

export class JudgmentSystem {
  private static readonly WINDOWS = {
    PERFECT: 40,
    GREAT: 80,
    GOOD: 120,
  };

  constructor(
    private characterManager: CharacterManager,
    private audioManager: AudioManager
  ) {
    InputManager.getInstance().onInput(this.handleInput);
  }

  private handleInput = (type: InputType) => {
    const currentTime = this.audioManager.getCurrentTimeMS();
    // Logic to find the closest note and judge it
    console.log(`Input ${type} at ${currentTime}ms`);
  };

  public judge(note: NoteData, hitTime: number): Judgment {
    const diff = Math.abs(note.time - hitTime);
    
    // Check if character matches
    if (note.type === 'normal' && note.characterId !== this.characterManager.getActiveCharacterId()) {
      return Judgment.MISS;
    }

    if (diff <= JudgmentSystem.WINDOWS.PERFECT) return Judgment.PERFECT;
    if (diff <= JudgmentSystem.WINDOWS.GREAT) return Judgment.GREAT;
    if (diff <= JudgmentSystem.WINDOWS.GOOD) return Judgment.GOOD;
    
    return Judgment.MISS;
  }
}
