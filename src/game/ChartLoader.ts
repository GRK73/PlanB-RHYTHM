export interface ChartMetadata {
  title: string;
  artist: string;
  bpm: number;
  offset: number;
  roster: number[];
}

export interface NoteData {
  time: number;
  lane: 0 | 1 | 'any'; // 0: Lower(Keyboard), 1: Upper(Mouse)
  type: 'normal' | 'switch';
  characterId?: number;
  targetCharId?: number;
}

export interface ChartData {
  meta: ChartMetadata;
  notes: NoteData[];
}

export class ChartLoader {
  public static async load(url: string): Promise<ChartData> {
    const response = await fetch(url);
    return await response.json();
  }
}
