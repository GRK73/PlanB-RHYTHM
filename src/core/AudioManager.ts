export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private startTime: number = 0;
  private isPlaying: boolean = false;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public init() {
    this.audioContext = new AudioContext();
  }

  public async loadAudio(url: string) {
    if (!this.audioContext) this.init();
    
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    this.audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
  }

  public play() {
    if (!this.audioContext || !this.audioBuffer) return;
    
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.audioBuffer;
    this.source.connect(this.audioContext.destination);
    
    this.startTime = this.audioContext.currentTime;
    this.source.start(0);
    this.isPlaying = true;
  }

  public getCurrentTimeMS(): number {
    if (!this.isPlaying || !this.audioContext) return 0;
    return (this.audioContext.currentTime - this.startTime) * 1000;
  }

  public stop() {
    if (this.source) {
      this.source.stop();
      this.isPlaying = false;
    }
  }
}
