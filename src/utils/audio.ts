/**
 * Decode base64 raw PCM (16-bit, 24000Hz, mono) audio into an AudioBuffer
 * and play it using Web Audio API.
 */

let activeSourceNode: AudioBufferSourceNode | null = null;
let currentAudioCtx: AudioContext | null = null;

export async function playRawPcm(
  base64Data: string, 
  sampleRate = 24000,
  onCompleted: () => void,
  onFailed: (err: string) => void
) {
  try {
    // Stop any currently playing audio track
    stopPcmAudio();

    // Setup audio context gracefully handling frame permissions or browser user gesture gates
    if (!currentAudioCtx || currentAudioCtx.state === "closed") {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      currentAudioCtx = new AudioCtxClass();
    }

    if (currentAudioCtx.state === "suspended") {
      await currentAudioCtx.resume();
    }

    // Convert base64 to binary string
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Int16 raw PCM decode
    // 2 bytes per sample
    const int16Buffer = new Int16Array(bytes.buffer);
    const float32Buffer = new Float32Array(int16Buffer.length);
    for (let i = 0; i < int16Buffer.length; i++) {
      // Normalise 16-bit integer [-32768, 32767] to [-1.0, 1.0] float
      float32Buffer[i] = int16Buffer[i] / 32768.0;
    }

    // Create an AudioBuffer and copy frame data
    const buffer = currentAudioCtx.createBuffer(1, float32Buffer.length, sampleRate);
    buffer.copyToChannel(float32Buffer, 0);

    // Play buffer using AudioBufferSourceNode
    const sourceNode = currentAudioCtx.createBufferSource();
    sourceNode.buffer = buffer;
    sourceNode.connect(currentAudioCtx.destination);
    
    sourceNode.onended = () => {
      if (activeSourceNode === sourceNode) {
        activeSourceNode = null;
        onCompleted();
      }
    };

    activeSourceNode = sourceNode;
    sourceNode.start(0);

  } catch (error: any) {
    console.error("PCM Audio playback error:", error);
    onFailed(error.message || "Failed to parse and play natural voice buffer.");
  }
}

export function stopPcmAudio() {
  if (activeSourceNode) {
    try {
      activeSourceNode.stop();
    } catch (e) {
      // Ignored
    }
    activeSourceNode = null;
  }
}
