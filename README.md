# Claude Code and Remotion's official skills: 24 runs

Remotion's official skills installed into a blank Remotion project, then the same prompt sent to Claude Code with `claude -p`, three runs per setup. The question: does Claude Code open the skill, and does the video change?

Video walkthrough: (link added after upload)

## Results

Claude Code 2.1.323, model `claude-opus-5-5`, Remotion 4.0.543, `claude -p`, 2026-11-19. All 24 runs finished (`success`) and rendered an MP4.

With the skills installed, the init record listed 13 skills starting with `remotion-` (36 skills in all). Without them, it listed 23 skills and none from Remotion.

| Job | Setup | Runs | Opened a skill | What it built |
|---|---|---|---|---|
| 15 s text animation | skills installed | 3 | 0/3 | |
| 15 s text animation | not installed | 3 | 0/3 | |
| word captions | skills installed | 3 | 0/3 | all 3 used `createTikTokStyleCaptions` |
| word captions | not installed | 3 | 0/3 | all 3 used `createTikTokStyleCaptions` |
| word captions | skill named at the top of the prompt | 3 | 3/3 | all 3 used `createTikTokStyleCaptions` |
| word captions | one line in `CLAUDE.md` | 3 | 3/3 | all 3 used `createTikTokStyleCaptions` |
| Tokyo → Osaka map | skill named at the top of the prompt | 3 | 3/3 | all 3: `maplibre-gl` with OpenFreeMap tiles |
| Tokyo → Osaka map | not installed | 3 | — | all 3: an outline map drawn in code from open data |

- With the skills installed and not named, the Skill tool was called 0 times in 6 runs.
- When named, the caption runs and g1, g2 opened `remotion-best-practices`. g3 opened `remotion-maps` instead.
- For captions, the runs that opened the skill and the runs that didn't used the same function, with the current word in yellow. The line breaks differ between runs, in both groups, and m3 set the text in capitals.
- For the map, the three runs without the skills all drew their own outline map (h1, h3: GeoJSON from `dataofjapan/land`; h2: `d3-geo` with `world-atlas`). All three also put a distance on screen that the prompt did not ask for, typed into the code as 400 km (h1 line 168, h2 line 107, h3 line 187). The three runs with the skill named did not.
- 24 runs, $7.71 in total. Per-run turns, seconds, cost and Skill calls are in `results.csv`.

## What this does and does not show

- Three runs per setup, one model, one Claude Code version, one Remotion version, a blank project. Your numbers will differ.
- For the map job, only "skill named" against "not installed" was run. "Installed but not named" and "one line in `CLAUDE.md`" were not tested for maps.
- The text-animation prompt has no "named" or `CLAUDE.md` runs.
- Settings, Skills, Hooks and MCP servers from outside the project were not loaded (`--setting-sources project --strict-mcp-config`).

## Files

| Path | What it is |
|---|---|
| `prompts/text.txt`, `prompts/captions.txt`, `prompts/map.txt` | The prompt for each job, the same for every run of that job |
| `prompts/CLAUDE.md` | The `CLAUDE.md` used in m1–m3 |
| `captions.json` | The 36 words for the caption job (Remotion Caption format, timings spaced 0.42 s apart for the test) |
| `runs/<id>/src/` | The code Claude Code wrote in each run |
| `results.csv` | The 24 runs behind the table |
| `run_lab.sh` | Creates the two blank projects, then runs one setup |
| `count_skills.sh` | Prints the skills a run opened, from its stream-json record |

Run ids: `run1`, `s2`, `s3` (text, skills installed) · `n1`–`n3` (text, not installed) · `c1`–`c3` (captions, installed) · `d1`–`d3` (captions, not installed) · `p1`–`p3` (captions, named) · `m1`–`m3` (captions, `CLAUDE.md`) · `g1`–`g3` (map, named) · `h1`–`h3` (map, not installed).

Not included: the raw stream-json records, the rendered MP4s, `node_modules`, and the map data the runs downloaded (h1 reads `public/japan.geojson`, which it fetched from `dataofjapan/land`).

## Check your own runs

```bash
claude -p "$PROMPT" --output-format stream-json --verbose > run.jsonl
bash count_skills.sh run.jsonl  # one line per skill opened; no output = no Skill calls
```

## Run it yourself

```bash
mkdir /tmp/remotion-lab && cd /tmp/remotion-lab
bash /path/to/this/repo/run_lab.sh setup
bash /path/to/this/repo/run_lab.sh c1 captions skill
bash /path/to/this/repo/run_lab.sh g1 map name
```

`run_lab.sh` is written for macOS (BSD `sed -i ''`, `cp -c`). On Linux, change them to `sed -i` and `cp -R`.

Each run is one `claude -p` call; ours cost $0.18–$0.55 each. `run1` ran in the freshly created skills project itself; the other 23 ran in a fresh copy of the blank project, with the skills copied in where the setup has them. `run_lab.sh` copies for every run.

## Map data credits

The rendered videos use OpenFreeMap tiles (© OpenFreeMap © OpenMapTiles © OpenStreetMap contributors), the Global Map Japan outlines from the Geospatial Information Authority of Japan via `dataofjapan/land` (h1, h3), and Natural Earth via `world-atlas` (h2).

## Licence

The prompts, scripts and the code in `runs/` are under the MIT licence (`LICENSE`). Running the code needs Remotion, which has its own licence terms. The map data is not included here; see the credits above.

Earlier tests on the same channel: [rule placement](https://github.com/guardraildev/claude-code-rule-placement) · [a 600-line CLAUDE.md](https://github.com/guardraildev/claude-code-long-claudemd)
