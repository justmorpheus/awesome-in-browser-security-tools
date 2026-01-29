# AGENTS.md - AI/Automation Agent Guidelines

## Project Overview

**Awesome In-Browser Security Tools** — A curated list of open-source security tools that run entirely in the browser with no backend or installation requirements.

**Source of truth**: `data/tools.json`

## Adding a Tool

1. Verify the repo and demo URLs work
2. Check the license (LICENSE file or package.json)
3. Add entry to `data/tools.json`:

```json
{
  "name": "Tool Name",
  "author": "Author Name",
  "repo": "https://github.com/owner/repo",
  "demo": "https://owner.github.io/repo/",
  "description": "Brief description (1-2 sentences).",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "category": "category_id",
  "license": "MIT",
  "donations": null
}
```

4. Run validation: `python3 scripts/validate_tools.py`
5. **Commit only `data/tools.json`** — CI/CD auto-generates the rest

### Required Fields

| Field | Description |
|-------|-------------|
| `name` | Unique tool name |
| `author` | Creator or organization |
| `repo` | Full URL to source code (must be `https://`) |
| `demo` | Full URL to live demo (must be `https://`) |
| `description` | Brief description (1-2 sentences) |
| `keywords` | Array of 3-6 search tags |
| `category` | Must match a key in `categories` object |

### Optional Fields

| Field | Description |
|-------|-------------|
| `license` | SPDX identifier (MIT, Apache-2.0, GPL-3.0, etc.) |
| `donations` | URL string or object with `github_sponsors`, `buy_me_a_coffee` keys |
| `browserFeatures` | Array of browser APIs used |

### Categories

Categories are defined in `data/tools.json` under the `categories` key: `sbom`, `network`, `cloud`, `auth`, `mobile`, `encoding`, `multi`, `password`, `compliance`.

## Tool Inclusion Criteria

Tools **must**:
- Run entirely in the browser (no backend required)
- Be open source
- Focus on information security
- Respect user privacy (no tracking)

## CI/CD Pipeline

**Do NOT run generate scripts or commit generated files.**

- `sync-tools.yml`: Validates on PRs; on merge to main, auto-generates `README.md` and `docs/js/tools-data.js`
- `deploy.yml`: Deploys `docs/` to GitHub Pages after sync completes

**Only commit**: `data/tools.json`
