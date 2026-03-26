import { Container, Graphics } from 'pixi.js';
import { NoteData } from './ChartLoader';
import { ObjectPool } from '../core/ObjectPool';

export class NoteManager {
  private container: Container;
  private activeNotes: { data: NoteData; sprite: Graphics }[] = [];
  private notePool: ObjectPool<Graphics>;
  
  private scrollSpeed: number = 0.5; // pixels per ms
  private judgmentLineX: number = 100;
  private laneY: { [key: number | string]: number } = {
    0: 400, // Lower
    1: 200, // Upper
    'any': 300,
  };

  constructor(parent: Container) {
    this.container = new Container();
    parent.addChild(this.container);

    this.notePool = new ObjectPool<Graphics>(
      () => new Graphics(),
      (g) => {
        g.clear();
        g.visible = false;
      },
      20
    );
  }

  public spawnNote(data: NoteData) {
    const sprite = this.notePool.acquire();
    sprite.visible = true;
    
    // PixiJS v8 API
    sprite.rect(-20, -20, 40, 40);
    sprite.fill(data.type === 'normal' ? 0xffffff : 0xff00ff);
    
    sprite.x = 2000; // Start off screen
    sprite.y = this.laneY[data.lane] || 300;
    
    this.container.addChild(sprite);
    this.activeNotes.push({ data, sprite });
  }

  public update(currentTime: number) {
    for (let i = this.activeNotes.length - 1; i >= 0; i--) {
      const { data, sprite } = this.activeNotes[i];
      
      // Calculate position: X = JudgmentLine + (NoteTime - CurrentTime) * ScrollSpeed
      sprite.x = this.judgmentLineX + (data.time - currentTime) * this.scrollSpeed;

      // Remove if passed screen
      if (sprite.x < -100) {
        this.container.removeChild(sprite);
        this.notePool.release(sprite);
        this.activeNotes.splice(i, 1);
      }
    }
  }

  public getActiveNotes() {
    return this.activeNotes;
  }
}
