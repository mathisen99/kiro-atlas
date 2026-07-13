#!/usr/bin/env python3
"""Generate the public, repository-only data used by the Kiro Atlas capsule."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(".")
OUTPUT = Path("capsule/shared/atlas.generated.ts")
ALLOWED_PREFIXES = (
    ".kiro/steering/",
    ".kiro/specs/",
    ".kiro/hooks/",
    "demo/",
)


def allowed(relative: Path) -> bool:
    value = relative.as_posix()
    return (
        not relative.is_absolute()
        and ".." not in relative.parts
        and (value == "README.md" or value.startswith(ALLOWED_PREFIXES))
    )


def read_text(relative: Path) -> str:
    if not allowed(relative):
        raise ValueError(f"Refusing to read non-allowlisted path: {relative.as_posix()}")
    return (ROOT / relative).read_text(encoding="utf-8")


def files_under(relative: Path, pattern: str = "*") -> list[Path]:
    if not allowed(relative / "placeholder"):
        raise ValueError(f"Refusing to scan non-allowlisted path: {relative.as_posix()}")
    return sorted(path.relative_to(ROOT) for path in (ROOT / relative).glob(pattern) if path.is_file())


def title(text: str, fallback: str) -> str:
    match = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
    return match.group(1).strip() if match else fallback


def headings(text: str) -> list[str]:
    return [match.group(1).strip() for match in re.finditer(r"^#{2,6}\s+(.+)$", text, re.MULTILINE)]


def first_paragraph(text: str) -> str:
    paragraphs = re.split(r"\n\s*\n", text)
    for paragraph in paragraphs:
        lines = [line.strip() for line in paragraph.splitlines() if line.strip()]
        if lines and not any(line.startswith(("#", "- ", "* ", "```")) for line in lines):
            return " ".join(lines)
    return ""


def bullets(text: str) -> list[str]:
    return [match.group(1).strip() for match in re.finditer(r"^\s*[-*]\s+(?!\[[ xX]\])(.+)$", text, re.MULTILINE)]


def markdown_tasks(text: str) -> list[dict[str, object]]:
    tasks: list[dict[str, object]] = []
    for match in re.finditer(r"^\s*[-*]\s+\[([ xX])\]\s+(.+)$", text, re.MULTILINE):
        tasks.append({"text": match.group(2).strip(), "completed": match.group(1).lower() == "x"})
    return tasks


def referenced_paths(text: str) -> list[str]:
    paths: set[str] = set()
    for value in re.findall(r"`([^`]+)`", text):
        candidate = Path(value.strip())
        if candidate.is_absolute() or ".." in candidate.parts or len(candidate.parts) < 2:
            continue
        if candidate.as_posix().startswith(("demo/", ".kiro/", "capsule/", "scripts/")):
            paths.add(candidate.as_posix())
    return sorted(paths)


def steering_data() -> list[dict[str, object]]:
    documents = []
    for path in files_under(Path(".kiro/steering"), "*.md"):
        text = read_text(path)
        documents.append(
            {
                "name": path.name,
                "path": path.as_posix(),
                "title": title(text, path.stem.replace("-", " ").title()),
                "summary": first_paragraph(text),
                "headings": headings(text),
                "bullets": bullets(text),
            }
        )
    return documents


def specs_data() -> list[dict[str, object]]:
    specs = []
    specs_root = ROOT / ".kiro/specs"
    for directory in sorted(path for path in specs_root.iterdir() if path.is_dir()):
        name = directory.name
        relative_dir = Path(".kiro/specs") / name
        parts: dict[str, str] = {}
        all_text = []
        for part in ("requirements", "design", "tasks"):
            path = relative_dir / f"{part}.md"
            if (ROOT / path).is_file():
                parts[part] = read_text(path)
                all_text.append(parts[part])
        tasks = markdown_tasks(parts.get("tasks", ""))
        completed = sum(1 for task in tasks if task["completed"])
        first_incomplete = next((str(task["text"]) for task in tasks if not task["completed"]), None)
        specs.append(
            {
                "name": name,
                "path": relative_dir.as_posix(),
                "hasRequirements": "requirements" in parts,
                "hasDesign": "design" in parts,
                "hasTasks": "tasks" in parts,
                "requirementHeadings": headings(parts.get("requirements", "")),
                "designHeadings": headings(parts.get("design", "")),
                "tasks": tasks,
                "completedTasks": completed,
                "incompleteTasks": len(tasks) - completed,
                "firstIncompleteTask": first_incomplete,
                "referencedFiles": referenced_paths("\n".join(all_text)),
            }
        )
    return specs


def hooks_data() -> list[dict[str, object]]:
    hooks = []
    for path in files_under(Path(".kiro/hooks"), "*.json"):
        payload = json.loads(read_text(path))
        entries = payload.get("hooks", [payload]) if isinstance(payload, dict) else []
        for entry in entries:
            action = entry.get("action", {})
            hooks.append(
                {
                    "name": entry.get("name", path.stem),
                    "description": entry.get("description", "Regenerates Atlas data after relevant workspace files are saved."),
                    "path": path.as_posix(),
                    "trigger": entry.get("trigger", "unknown"),
                    "matcher": entry.get("matcher", ""),
                    "actionType": action.get("type", "unknown"),
                    "command": action.get("command", ""),
                    "enabled": entry.get("enabled", True),
                }
            )
    return hooks


def exported_symbols(text: str) -> list[dict[str, str]]:
    pattern = re.compile(r"^export\s+(?:declare\s+)?(?:const\s+)?(type|interface|class|function)\s+([A-Za-z_$][\w$]*)", re.MULTILINE)
    return [{"kind": match.group(1), "name": match.group(2)} for match in pattern.finditer(text)]


def project_files_data(specs: list[dict[str, object]]) -> list[dict[str, object]]:
    references: dict[str, list[str]] = {}
    for spec in specs:
        for path in spec["referencedFiles"]:
            references.setdefault(str(path), []).append(str(spec["name"]))

    result = []
    for path in files_under(Path("demo"), "**/*"):
        result.append(
            {
                "path": path.as_posix(),
                "name": path.name,
                "extension": path.suffix.removeprefix(".") or "file",
                "symbols": exported_symbols(read_text(path)) if path.suffix in {".ts", ".tsx"} else [],
                "referencedBy": sorted(references.get(path.as_posix(), [])),
            }
        )
    return result


def project_data() -> dict[str, str]:
    text = read_text(Path("README.md"))
    return {
        "name": title(text, "Kiro Atlas"),
        "description": first_paragraph(text),
        "tagline": "Make the hidden .kiro workspace visible",
    }


def main() -> None:
    steering = steering_data()
    specs = specs_data()
    hooks = hooks_data()
    project_files = project_files_data(specs)
    total_tasks = sum(int(spec["completedTasks"]) + int(spec["incompleteTasks"]) for spec in specs)
    completed_tasks = sum(int(spec["completedTasks"]) for spec in specs)
    next_spec = next((spec for spec in specs if spec["firstIncompleteTask"]), None)

    atlas_data = {
        "project": project_data(),
        "steering": steering,
        "specs": specs,
        "hooks": hooks,
        "projectFiles": project_files,
        "summary": {
            "specs": len(specs),
            "steeringFiles": len(steering),
            "hooks": len(hooks),
            "demoFiles": len(project_files),
            "completedTasks": completed_tasks,
            "totalTasks": total_tasks,
            "progressPercent": round((completed_tasks / total_tasks) * 100) if total_tasks else 0,
        },
        "nextStep": (
            {
                "spec": next_spec["name"],
                "task": next_spec["firstIncompleteTask"],
                "path": f"{next_spec['path']}/tasks.md",
            }
            if next_spec
            else {"spec": None, "task": "All tracked tasks are complete", "path": None}
        ),
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    generated = "// Generated by scripts/generate_atlas.py. Do not edit manually.\n"
    generated += "export const atlasData = " + json.dumps(atlas_data, indent=2, ensure_ascii=False) + ";\n"
    OUTPUT.write_text(generated, encoding="utf-8")
    print(
        f"Kiro Atlas updated: {len(specs)} specs, {len(steering)} steering files, "
        f"{len(hooks)} hook, {len(project_files)} demo files"
    )


if __name__ == "__main__":
    main()
