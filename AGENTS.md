# AGENTS.md - AI/Automation Agent Guidelines

This document provides guidelines for AI coding agents and automation tools working on this project.

## Project Overview

**Awesome In-Browser Security Tools** is a curated list of open-source security tools that run entirely in the browser with no backend or installation requirements.

### Core Philosophy
- **Privacy-first**: No data sent to servers, no tracking
- **Zero installation**: Works directly in the browser
- **Offline capable**: Many tools work without network access
- **Transparent hosting**: GitHub Pages with visible source code

Reference: [Making Security Tools Accessible: Why I Chose the Browser](https://blog.anantshri.info/making-security-tools-accessible-why-i-chose-the-browser/)

## Project Structure

```
├── data/
│   └── tools.json           # Source of truth for all tools
├── docs/                    # GitHub Pages website
│   ├── index.html           # Main HTML page
│   ├── css/style.css        # Styles (uses Fira Code font)
│   └── js/
│       ├── app.js           # Client-side search/filter/sort logic
│       └── tools-data.js    # Auto-generated from tools.json
├── scripts/
│   ├── validate_tools.py    # Validates tools.json format
│   ├── generate_html.py     # Generates tools-data.js from tools.json
│   └── generate_readme.py   # Updates README.md from tools.json
├── README.md                # Auto-generated tool listing
├── CONTRIBUTING.md          # Human contributor guidelines
└── .github/workflows/       # CI/CD automation
```

## How to Add a New Tool

### Step 1: Edit `data/tools.json`

Add a new entry to the `tools` array:

```json
{
  "name": "Tool Name",
  "author": "Author Name",
  "repo": "https://github.com/owner/repo",
  "demo": "https://owner.github.io/repo/",
  "description": "Brief description of what the tool does (1-2 sentences).",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "category": "sbom",
  "license": "MIT",
  "donations": null
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Tool name (must be unique) |
| `author` | string | Creator or organization name |
| `repo` | string | Full URL to source code repository |
| `demo` | string | Full URL to live demo |
| `description` | string | Brief description (1-2 sentences, be concise) |
| `keywords` | array | Descriptive tags for search/filtering (3-6 recommended) |
| `category` | string | Must match a key in the `categories` object |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `donations` | string/object/null | `null` | Sponsor links |
| `license` | string | - | SPDX license identifier (MIT, Apache-2.0, GPL-3.0, etc.) |
| `browserFeatures` | array | - | Browser APIs used (localStorage, indexedDB, WebRTC, etc.) |

### Donations Format

Two formats supported:

```json
// Simple URL
"donations": "https://github.com/sponsors/username"

// Multiple platforms
"donations": {
  "github_sponsors": "https://github.com/sponsors/username",
  "buy_me_a_coffee": "https://buymeacoffee.com/username"
}
```

### Available Categories

Categories are defined in `data/tools.json` under the `categories` key:

| ID | Name | Description |
|----|------|-------------|
| `sbom` | SBOM & Dependency Analysis | Software Bill of Materials tools |
| `network` | DNS & Network Analysis | Network reconnaissance and DNS tools |
| `cloud` | Cloud Security | Cloud infrastructure and IAM security |
| `auth` | Authentication & Keys | Token and key management tools |
| `mobile` | Mobile Security | Mobile app security and analysis |
| `encoding` | Encoding & Cryptography | Encryption, encoding, hashing tools |
| `multi` | Multi-Purpose Security | Comprehensive security toolkits |
| `password` | Password Security | Password analysis and generation |
| `compliance` | Compliance & Risk Assessment | Security frameworks and risk tools |

To add a new category, add it to the `categories` object with `name`, `description`, and `order` fields.

## Validation

**Always validate before committing:**

```bash
python scripts/validate_tools.py
```

This checks:
- JSON syntax validity
- All required fields present
- URLs properly formatted (must start with `https://`)
- Category exists in the categories object
- No duplicate tool names
- Keywords is non-empty array of strings

## Regenerating Files

After modifying `data/tools.json`:

```bash
# Regenerate the JS data file for the website
python scripts/generate_html.py

# Regenerate README.md
python scripts/generate_readme.py
```

**Note**: The CI/CD pipeline runs these automatically on merge to main.

## Local Testing

To test the website locally:

```bash
# Using Python
cd docs && python -m http.server 8000

# Then open http://localhost:8000
```

The page also works with `file://` protocol (open `docs/index.html` directly).

## Code Style Guidelines

### CSS (`docs/css/style.css`)
- Use CSS custom properties (variables) for theming
- Support both light and dark modes via `[data-theme="dark"]`
- Use Fira Code font (loaded from Google Fonts)
- Mobile-first responsive design with breakpoints at:
  - 1024px (large tablets)
  - 768px (tablets)
  - 640px (card layout)
  - 400px (small phones)
- Keep it minimal - avoid frameworks

### JavaScript (`docs/js/app.js`)
- Vanilla JavaScript only - no frameworks
- IIFE pattern for encapsulation
- Uses `window.TOOLS_DATA` loaded from tools-data.js
- Client-side search, filter, and sort
- Theme preference stored in localStorage

### HTML (`docs/index.html`)
- Semantic HTML5
- Accessibility: proper ARIA labels, keyboard navigation
- No external dependencies except Google Fonts and Plausible analytics

## Criteria for Tool Inclusion

Tools **must**:
1. ✅ Run entirely in the browser (no backend server required)
2. ✅ Be open source (publicly available source code)
3. ✅ Focus on information security
4. ✅ Respect user privacy (no tracking or data exfiltration)

Tools **should**:
- Have a working live demo
- Be actively maintained (check last commit badge)
- Have clear documentation

## Common Tasks

### Adding a tool from a GitHub repo

1. Visit the repo and demo URLs to verify they work
2. Check the license (look for LICENSE file or package.json)
3. Identify 3-6 relevant keywords
4. Determine the appropriate category
5. Add entry to `data/tools.json`
6. Run validation: `python scripts/validate_tools.py`
7. Regenerate files: `python scripts/generate_html.py && python scripts/generate_readme.py`

### Updating an existing tool

1. Find the tool in `data/tools.json`
2. Update the relevant fields
3. Validate and regenerate as above

### Removing a tool

1. Remove the tool object from the `tools` array in `data/tools.json`
2. Validate and regenerate as above

### Adding a new category

1. Add to `categories` object in `data/tools.json`:
   ```json
   "new_category": {
     "name": "Category Display Name",
     "description": "What this category covers",
     "order": 10
   }
   ```
2. The `order` field determines dropdown sort order (lower = earlier)

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`):
1. Runs validation on PRs
2. Regenerates files on merge to main
3. Deploys to GitHub Pages

## Troubleshooting

### Validation fails with "Invalid category"
The tool's `category` field must exactly match a key in the `categories` object.

### Website shows "Error: Tools data not loaded"
Run `python scripts/generate_html.py` to regenerate `tools-data.js`.

### Badge images not loading
The last-commit badges use badgen.net. Ensure the repo URL is a valid public GitHub repo.

### Changes not appearing on the website
1. Ensure `tools-data.js` was regenerated
2. Clear browser cache
3. Check the GitHub Actions workflow for errors
