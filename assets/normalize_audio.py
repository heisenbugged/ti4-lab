from pydub import AudioSegment
import os
from pathlib import Path
import argparse
import numpy as np
import pyloudnorm as pyln
import soundfile as sf

def normalize_audio_files(input_dir, output_dir, target_lufs=-23):
    """
    Normalize audio files to a target loudness level using perceptual loudness normalization.
    This uses the ITU-R BS.1770-4 algorithm which is better at handling different voice types.

    Args:
        input_dir (str): Directory containing input audio files
        output_dir (str): Directory to save normalized files
        target_lufs (float): Target loudness in LUFS (default: -23 LUFS)
    """
    # Convert to Path objects
    input_dir = Path(input_dir)
    output_dir = Path(output_dir)

    # Get all mp3 files recursively
    audio_files = list(input_dir.rglob('*.mp3'))

    print(f"Found {len(audio_files)} audio files to process")

    # Initialize the loudness meter with standard sample rate
    meter = pyln.Meter(rate=44100)  # Create BS.1770 meter with 44.1kHz sample rate

    for audio_file in audio_files:
        try:
            # Calculate the relative path from input directory
            rel_path = audio_file.relative_to(input_dir)
            output_file = output_dir / rel_path
            output_file.parent.mkdir(parents=True, exist_ok=True)

            # Load the audio file
            audio = AudioSegment.from_file(str(audio_file))

            # Convert to numpy array and normalize to float between -1 and 1
            samples = np.array(audio.get_array_of_samples(), dtype=np.float32)
            samples = samples / (2**15 if audio.sample_width == 2 else 2**31)

            if audio.channels == 2:
                samples = samples.reshape((-1, 2))

            # Calculate current loudness using BS.1770
            current_lufs = meter.integrated_loudness(samples)

            # Calculate required gain adjustment
            gain_adjustment = target_lufs - current_lufs

            # Apply gain adjustment
            normalized_audio = audio + gain_adjustment

            # Export the normalized file
            normalized_audio.export(
                str(output_file),
                format='mp3',
                parameters=["-ar", "44100"]  # Maintain 44.1kHz sample rate
            )

            print(f"Processed {rel_path}: Adjusted gain by {gain_adjustment:.1f}dB (from {current_lufs:.1f} LUFS to {target_lufs} LUFS)")

        except Exception as e:
            print(f"Error processing {audio_file}: {str(e)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Normalize audio files to a target loudness level.')
    parser.add_argument('input_directory', help='Directory containing input audio files')
    parser.add_argument('output_directory', help='Directory to save normalized files')
    parser.add_argument('--target-lufs', type=float, default=-23, help='Target loudness in LUFS (default: -23)')

    args = parser.parse_args()

    normalize_audio_files(args.input_directory, args.output_directory, args.target_lufs)