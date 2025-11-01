#!/bin/bash

# Find all IFT and BBS protein directories with v4.json files

echo "Scanning for IFT and BBS proteins with v4.json files..."
echo ""

for dir in /emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/*{IFT,BBS}*/; do
  if [ -f "$dir/AF3/AF3_PD_analysis_v4.json" ]; then
    basename=$(basename "$dir")
    echo "$dir/AF3/AF3_PD_analysis_v4.json"
  fi
done
