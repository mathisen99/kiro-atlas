# Kiro Atlas

Kiro Atlas is a small visual guide to the files and workflow inside a Kiro workspace. It turns the committed steering, specs, hooks, and fictional Quest Board source files in this repository into a polished Lakebed homepage for new Kiro users.

## Why it helps

Kiro's workspace is powerful, but the relationship between persistent steering, feature specs, tasks, hooks, and source code can be hard to see at first. Atlas puts that relationship on one page and recommends the next incomplete task.

The included **Quest Board** project is intentionally tiny: users can create quests, assign Easy, Medium, or Hard difficulty, and complete them. It exists only to give the Atlas realistic artifacts to visualize.

## How updates work

```text
Edit .kiro/ or demo/ → Kiro PostFileSave hook → Python generator → Atlas data → Lakebed UI
```

The hook runs `python3 scripts/generate_atlas.py`. It does **not** deploy. Deployment is always a separate manual command.

## Quick start

No Node modules need to be installed.

```sh
python3 scripts/generate_atlas.py
npx lakebed@staging dev ./capsule
```

Open the local URL printed by Lakebed.

Build the anonymous artifact:

```sh
npx lakebed@staging build ./capsule --target anonymous --out .lakebed/atlas-artifact.json
```

Start Kiro CLI v3:

```sh
kiro-cli --v3
```

## Manual deployment

The currently compatible Lakebed release is on the `staging` npm tag. Deploy to the matching staging service with:

```sh
npx lakebed@staging deploy ./capsule --json
```

To target production after its auth registration service is available:

```sh
npx lakebed@staging deploy ./capsule --api https://api.lakebed.dev --json
```

The unqualified `npx lakebed` command can be restored after npm's `latest` release generates the required database manifest and `maxIndexKeyBytes: 2048`. See [AGENTS.md](AGENTS.md) for the exact compatibility notes future coding agents should follow.

## Public-data boundary

The generator reads only these committed repository locations:

- `.kiro/steering/`
- `.kiro/specs/`
- `.kiro/hooks/`
- `demo/`
- `README.md`

It does not read `.git`, environment files, files outside the repository, the home directory, environment variables, usernames, or system information. Generated output contains repository-relative paths only. The file `capsule/shared/atlas.generated.ts` is generated and must not be edited manually.

## Demo script

1. Generate Atlas data and start Lakebed.
2. Show the one incomplete `quest-difficulty` task on the homepage.
3. Start `kiro-cli --v3` and open the `quest-difficulty` spec.
4. Implement `difficultyLabel` in `demo/difficulty.ts`.
5. Mark the final task complete in `.kiro/specs/quest-difficulty/tasks.md`.
6. Save and show the hook regenerate Atlas data.
7. Refresh the homepage to show full progress and the updated next step.

## Repository map

```text
.kiro/          Kiro steering, specs, and the refresh hook
demo/           Fictional Quest Board TypeScript
scripts/        Standard-library Atlas generator
capsule/        Lakebed and Preact homepage
```

This is intentionally a one-day teaching demo: the Quest Board is not a runnable application, the parser targets the included Markdown conventions, and deployment remains manual.
