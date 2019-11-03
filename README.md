03 Nov 2019
## important info

# public/audio/split.py
example usage:
`python3 split.py <EXAMPLE_DIR>`

requirements - input filenames can't have a space in them.
use this inside the audio directory to rename the stems:
`rename --dry-run 's/<EXAMPLE> (\w+).wav/<EXAMPLE>_$1.wav/g' *`

## todos & ideas
20 May 2019
- use a bump map with custom shaders
- shadow map

16 July 2019
- 'parameterize' the octahedron for quicker modeling
