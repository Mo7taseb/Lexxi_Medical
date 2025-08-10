/**
 * Audio file compression utilities
 */

export interface CompressionOptions {
  quality?: number; // 0.1 to 1.0
  sampleRate?: number; // Hz, e.g., 16000, 22050, 44100
  maxSizeMB?: number; // Maximum size in MB
}

export class AudioCompressor {
  /**
   * Compress audio file using Web Audio API
   */
  static async compressAudio(
    file: File, 
    options: CompressionOptions = {}
  ): Promise<File> {
    const {
      quality = 0.7,
      sampleRate = 16000, // Lower sample rate for speech recognition
      maxSizeMB = 25
    } = options;

    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const fileReader = new FileReader();

      fileReader.onload = async () => {
        try {
          const arrayBuffer = fileReader.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // Create new audio buffer with lower sample rate
          const targetSampleRate = Math.min(sampleRate, audioBuffer.sampleRate);
          const ratio = audioBuffer.sampleRate / targetSampleRate;
          const targetLength = Math.floor(audioBuffer.length / ratio);

          const newAudioBuffer = audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            targetLength,
            targetSampleRate
          );

          // Downsample audio
          for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const oldData = audioBuffer.getChannelData(channel);
            const newData = newAudioBuffer.getChannelData(channel);

            for (let i = 0; i < targetLength; i++) {
              const sourceIndex = Math.floor(i * ratio);
              newData[i] = oldData[sourceIndex];
            }
          }

          // Convert to WAV format
          const wavBuffer = this.audioBufferToWav(newAudioBuffer);
          const compressedFile = new File(
            [wavBuffer], 
            file.name.replace(/\.[^/.]+$/, '_compressed.wav'),
            { type: 'audio/wav' }
          );

          // Check if compression achieved target size
          if (compressedFile.size > maxSizeMB * 1024 * 1024) {
            // Try with even lower quality/sample rate
            if (targetSampleRate > 8000) {
              return this.compressAudio(file, {
                ...options,
                sampleRate: Math.max(8000, targetSampleRate * 0.5)
              }).then(resolve).catch(reject);
            }
          }

          resolve(compressedFile);
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = () => reject(new Error('Failed to read audio file'));
      fileReader.readAsArrayBuffer(file);
    });
  }

  /**
   * Convert AudioBuffer to WAV format
   */
  private static audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);

    // Convert audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  }

  /**
   * Get file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if file needs compression
   */
  static needsCompression(file: File, maxSizeMB: number = 25): boolean {
    return file.size > (maxSizeMB * 1024 * 1024);
  }
}
