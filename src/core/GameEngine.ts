import { Application, Container } from 'pixi.js';
import { InputManager } from './InputManager';
import { CharacterManager } from '../game/CharacterManager';
import { AudioManager } from './AudioManager';
import { NoteManager } from '../game/NoteManager';
import { JudgmentSystem } from '../game/JudgmentSystem';
import { ChartData, ChartLoader } from '../game/ChartLoader';

export class GameEngine {
  public app: Application;
  public characterManager: CharacterManager;
  public audioManager: AudioManager;
  public noteManager: NoteManager | null = null;
  public judgmentSystem: JudgmentSystem | null = null;
  
  private static instance: GameEngine;
  private container: HTMLElement | null = null;
  private gameLayer: Container;

  private chart: ChartData | null = null;
  private currentNoteIndex: number = 0;

  private constructor() {
    this.app = new Application();
    this.characterManager = new CharacterManager();
    this.audioManager = AudioManager.getInstance();
    this.gameLayer = new Container();
  }

  public static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance;
  }

  public async init(container: HTMLElement) {
    this.container = container;
    await this.app.init({
      resizeTo: container,
      backgroundColor: 0x000000,
      antialias: true,
    });
    container.appendChild(this.app.canvas);
    this.app.stage.addChild(this.gameLayer);

    InputManager.getInstance().init(container);
    this.noteManager = new NoteManager(this.gameLayer);
    this.judgmentSystem = new JudgmentSystem(this.characterManager, this.audioManager);

    this.app.ticker.add((ticker) => {
      this.update(ticker.lastTime); // use total time if needed or delta
      this.gameLoop();
    });
  }

  public async startSong(songUrl: string, chartUrl: string) {
    this.chart = await ChartLoader.load(chartUrl);
    await this.audioManager.loadAudio(songUrl);
    
    this.characterManager.setRoster(this.chart.meta.roster);
    this.currentNoteIndex = 0;
    
    this.audioManager.play();
  }

  private gameLoop() {
    if (!this.chart || !this.noteManager) return;
    
    const currentTime = this.audioManager.getCurrentTimeMS();
    
    // Spawn notes
    while (
      this.currentNoteIndex < this.chart.notes.length &&
      this.chart.notes[this.currentNoteIndex].time <= currentTime + 2000 // spawn 2s ahead
    ) {
      this.noteManager.spawnNote(this.chart.notes[this.currentNoteIndex]);
      this.currentNoteIndex++;
    }

    this.noteManager.update(currentTime);
  }

  private update(_time: number) {
    // Other updates if needed
  }

  public destroy() {
    if (this.container) {
      InputManager.getInstance().destroy(this.container);
    }
    this.app.destroy(true, { children: true, texture: true });
  }
}
