# Repository Structure

The repository separates Kiro knowledge, fictional application code, generation logic, and the visual capsule so a new user can see each responsibility at a glance.

## Directories

- `.kiro/` contains steering, specs, and Kiro CLI hooks
- `demo/` contains the fictional Quest Board source files
- `scripts/` contains the Atlas generator
- `capsule/` contains the Lakebed homepage
- `capsule/shared/atlas.generated.ts` is generated and must not be edited manually

## Boundaries

- Generated data contains repository-relative paths only
- The generator reads only its documented repository allowlist
- Demo files are educational samples, not a separate runnable product
