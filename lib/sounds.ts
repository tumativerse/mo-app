// Sound effects system for the fitness app
// Uses Web Audio API to generate sounds programmatically

type SoundType =
  | 'setComplete'
  | 'workoutComplete'
  | 'personalRecord'
  | 'click'
  | 'success'
  | 'levelUp';

// Web Audio API sound generator
class WebAudioSoundGenerator {
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext();
    }
  }

  private getContext(): AudioContext | null {
    return this.audioContext;
  }

  playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  playChord(frequencies: number[], duration: number, volume: number = 0.2) {
    frequencies.forEach((freq) => this.playTone(freq, duration, 'sine', volume));
  }

  playMelody(notes: Array<{ frequency: number; duration: number }>, volume: number = 0.3) {
    const ctx = this.getContext();
    if (!ctx) return;

    let currentTime = ctx.currentTime;
    notes.forEach((note) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = note.frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + note.duration);

      currentTime += note.duration;
    });
  }
}

class SoundManager {
  private generator: WebAudioSoundGenerator;
  private enabled: boolean = true;
  private volume: number = 0.3;

  constructor() {
    this.generator = new WebAudioSoundGenerator();

    if (typeof window !== 'undefined') {
      // Load saved preferences from localStorage
      const savedEnabled = localStorage.getItem('soundEnabled');
      const savedVolume = localStorage.getItem('soundVolume');

      this.enabled = savedEnabled !== null ? savedEnabled === 'true' : true;
      this.volume = savedVolume !== null ? parseFloat(savedVolume) : 0.3;
    }
  }

  play(soundName: SoundType) {
    if (!this.enabled) return;

    try {
      switch (soundName) {
        case 'setComplete':
          // Quick ascending beep
          this.generator.playMelody(
            [
              { frequency: 440, duration: 0.08 },
              { frequency: 554, duration: 0.08 },
            ],
            this.volume
          );
          break;

        case 'workoutComplete':
          // Victory fanfare
          this.generator.playMelody(
            [
              { frequency: 523, duration: 0.15 },
              { frequency: 659, duration: 0.15 },
              { frequency: 784, duration: 0.15 },
              { frequency: 1047, duration: 0.3 },
            ],
            this.volume
          );
          break;

        case 'personalRecord':
          // Triumphant chord progression
          setTimeout(() => this.generator.playChord([523, 659, 784], 0.4, this.volume), 0);
          setTimeout(() => this.generator.playChord([587, 740, 880], 0.4, this.volume), 150);
          setTimeout(() => this.generator.playChord([659, 831, 988], 0.6, this.volume), 300);
          break;

        case 'click':
          // Subtle click
          this.generator.playTone(800, 0.05, 'square', this.volume * 0.5);
          break;

        case 'success':
          // Pleasant confirmation
          this.generator.playMelody(
            [
              { frequency: 659, duration: 0.1 },
              { frequency: 831, duration: 0.2 },
            ],
            this.volume
          );
          break;

        case 'levelUp':
          // Ascending arpeggio
          this.generator.playMelody(
            [
              { frequency: 523, duration: 0.1 },
              { frequency: 659, duration: 0.1 },
              { frequency: 784, duration: 0.1 },
              { frequency: 1047, duration: 0.3 },
            ],
            this.volume
          );
          break;
      }
    } catch (error) {
      console.warn(`Error playing sound: ${soundName}`, error);
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEnabled', String(enabled));
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundVolume', String(this.volume));
    }
  }

  getEnabled(): boolean {
    return this.enabled;
  }

  getVolume(): number {
    return this.volume;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();

// Convenience functions
export const playSetComplete = () => soundManager.play('setComplete');
export const playWorkoutComplete = () => soundManager.play('workoutComplete');
export const playPersonalRecord = () => soundManager.play('personalRecord');
export const playClick = () => soundManager.play('click');
export const playSuccess = () => soundManager.play('success');
export const playLevelUp = () => soundManager.play('levelUp');
