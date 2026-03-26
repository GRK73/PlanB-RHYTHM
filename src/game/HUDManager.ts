import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { CharacterManager } from './CharacterManager';

export class HUDManager {
  private container: Container;
  private wheelDeck: Container;
  private gearGraphics: Graphics;
  private comboText: Text;

  private targetRotation: number = 0;
  private currentRotation: number = 0;

  constructor(parent: Container, private characterManager: CharacterManager) {
    this.container = new Container();
    parent.addChild(this.container);

    this.gearGraphics = new Graphics();
    this.container.addChild(this.gearGraphics);

    this.wheelDeck = new Container();
    this.container.addChild(this.wheelDeck);

    const style = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 48,
      fill: '#ffffff',
      fontWeight: 'bold',
    });
    this.comboText = new Text({ text: '', style });
    this.comboText.x = 100;
    this.comboText.y = 50;
    this.container.addChild(this.comboText);

    this.initGear();
    this.initWheelDeck();
  }

  private initGear() {
    const g = this.gearGraphics;
    g.clear();
    
    // Lower Lane (Keyboard) - Blueish
    g.rect(0, 395, 2000, 10);
    g.fill({ color: 0x00aaff, alpha: 0.3 });
    
    // Upper Lane (Mouse) - Redish
    g.rect(0, 195, 2000, 10);
    g.fill({ color: 0xff4400, alpha: 0.3 });

    // Judgment Line
    g.rect(100, 150, 2, 300);
    g.fill(0xffffff);
  }

  private initWheelDeck() {
    // Simple circular representation of the roster
    const center = new Graphics();
    center.circle(0, 0, 40);
    center.stroke({ width: 2, color: 0xffffff });
    
    this.wheelDeck.addChild(center);
    this.wheelDeck.x = 100;
    this.wheelDeck.y = 500; // Position at bottom-left near judgment
  }

  public update(delta: number) {
    // Smoothly rotate the wheel deck based on active character
    const activeIndex = this.characterManager.getActiveIndex();
    this.targetRotation = activeIndex * (Math.PI * 2 / 3); // Assuming 3 chars
    
    this.currentRotation += (this.targetRotation - this.currentRotation) * 0.2 * delta;
    this.wheelDeck.rotation = this.currentRotation;
  }

  public updateCombo(combo: number) {
    this.comboText.text = combo > 0 ? `${combo} COMBO` : '';
  }
}
