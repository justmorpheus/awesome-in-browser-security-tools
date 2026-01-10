# Contributing to Awesome In-Browser Security Tools

Thank you for your interest in contributing! Adding a new tool is simple — just edit one file.

## How to Add a Tool

1. **Fork** this repository
2. **Edit** `data/tools.json` — add your tool entry to the `tools` array
3. **Submit** a pull request
4. ⚠️ **Important:** Please allow edits from maintainers on your PR (keep "Allow edits by maintainers" checked)

That's it! We'll review your submission and our automation will:
- Validate your entry format
- Update README.md automatically
- Update the website automatically

## Tool Entry Format

Add your tool to the `tools` array in `data/tools.json`:

```json
{
  "name": "Tool Name",
  "author": "Author Name",
  "repo": "https://github.com/owner/repo",
  "demo": "https://owner.github.io/repo/",
  "description": "Brief description of what the tool does (1-2 sentences).",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "category": "sbom"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Tool name |
| `author` | string | Creator or organization |
| `repo` | string | URL to source code repository |
| `demo` | string | URL to live demo |
| `description` | string | Brief description (1-2 sentences) |
| `keywords` | array | Descriptive tags for search/filtering |
| `category` | string | One of: `sbom`, `network`, `cloud`, `auth`, `mobile` |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `donations` | string or object | `null` | Sponsor links (see below) |
| `license` | string | - | SPDX license identifier (MIT, Apache-2.0, etc.) |

#### Donations Format

The `donations` field supports two formats:

1. **Simple URL string**: `"donations": "https://github.com/sponsors/username"`

2. **Object with multiple platforms**:
```json
"donations": {
  "github_sponsors": "https://github.com/sponsors/username",
  "buy_me_a_coffee": "https://buymeacoffee.com/username"
}
```

## Categories

Categories are defined in the `categories` section of `data/tools.json`. Current categories:

| Category | Description |
|----------|-------------|
| `sbom` | SBOM & Dependency Analysis |
| `network` | DNS & Network Analysis |
| `cloud` | Cloud Security |
| `auth` | Authentication & Keys |
| `mobile` | Mobile Security |

Need a new category? Add it to the `categories` object in `tools.json` with a `name`, `description`, and `order` field.

## Criteria for Inclusion

To be included, a tool **must**:

1. **Run entirely in the browser** — No backend server required
2. **Be open source** — Publicly available source code
3. **Focus on information security** — Relevant to security professionals
4. **Respect user privacy** — No tracking or data exfiltration

## Example Entry

```json
{
  "name": "SBOM Play",
  "author": "Cyfinoid",
  "repo": "https://github.com/cyfinoid/sbomplay",
  "demo": "https://cyfinoid.github.io/sbomplay/",
  "description": "A privacy-focused SBOM visualization tool with vulnerability insights and license analysis.",
  "keywords": ["SBOM", "vulnerability", "license", "CycloneDX", "SPDX"],
  "category": "sbom",
  "license": "MIT"
}
```

## Validation

Before submitting, you can validate your entry locally:

```bash
python scripts/validate_tools.py
```

This checks:
- JSON syntax is valid
- All required fields are present
- URLs are properly formatted
- Category exists

## Questions?

Open an issue if you have questions about the contribution process.
