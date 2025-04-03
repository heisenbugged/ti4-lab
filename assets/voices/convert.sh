#!/bin/bash

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is not installed. Please install it to continue."
    exit 1
fi

# Create a counter for processed files
count=0

# Find all .wav files recursively and convert them
find . -type f -name "*.wav" | while read -r wavfile; do
    # Extract just the filename without path and extension
    filename=$(basename "$wavfile" .wav)

    echo "Converting: $wavfile"

    # Convert to mp3 in the current directory
    ffmpeg -i "$wavfile" -q:a 0 "./$filename.mp3" -hide_banner -loglevel error

    # Check if conversion was successful
    if [ $? -eq 0 ]; then
        echo "Successfully converted: $filename.mp3"
        ((count++))
    else
        echo "Failed to convert: $wavfile"
    fi
done

echo "Conversion complete! Converted $count files."