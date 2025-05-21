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

    # Get the directory of the source file
    dir=$(dirname "$wavfile")

    echo "Converting: $wavfile"

    # Convert to mp3 in the same directory as the source file
    ffmpeg -i "$wavfile" -q:a 0 "$dir/$filename.mp3" -hide_banner -loglevel error

    # Check if conversion was successful
    if [ $? -eq 0 ]; then
        echo "Successfully converted: $dir/$filename.mp3"
        ((count++))
    else
        echo "Failed to convert: $wavfile"
    fi
done

echo "Conversion complete! Converted $count files."