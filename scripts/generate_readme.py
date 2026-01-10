#!/usr/bin/env python3
"""
Generate README.md from tools.json
Categories and their order are read from the JSON file.
"""

import json
from pathlib import Path
from datetime import datetime, timezone


def get_repo_path(repo_url: str) -> str:
    """Extract owner/repo from GitHub URL."""
    if "github.com/" in repo_url:
        parts = repo_url.rstrip("/").split("github.com/")[-1]
        return parts
    return ""


def get_sorted_categories(categories: dict) -> list:
    """Return category IDs sorted by their order field."""
    return sorted(
        categories.keys(),
        key=lambda c: categories[c].get("order", 999)
    )


def generate_tool_entry(tool: dict) -> str:
    """Generate markdown for a single tool."""
    repo_path = get_repo_path(tool["repo"])
    
    keywords = ", ".join([f"`{kw}`" for kw in tool["keywords"]])
    
    entry = f"""### {tool["name"]}

{tool["description"]}

| Property | Value |
|----------|-------|
| **Author** | {tool["author"]} |
| **Demo** | [{tool["demo"].replace("https://", "")}]({tool["demo"]}) |
| **Repository** | [{tool["repo"].replace("https://", "")}]({tool["repo"]}) |
| **Keywords** | {keywords} |"""

    if repo_path:
        entry += f"""
| **License** | ![License](https://badgen.net/github/license/{repo_path}) |
| **Last Update** | ![Last Commit](https://badgen.net/github/last-commit/{repo_path}) |"""
    else:
        license_text = tool.get("license", "Unknown")
        entry += f"""
| **License** | {license_text} |"""

    donations = tool.get("donations")
    if donations:
        if isinstance(donations, str):
            # Legacy: single URL string
            entry += f"""
| **Sponsor** | [Support the author]({donations}) |"""
        elif isinstance(donations, dict):
            # New format: object with multiple platforms
            sponsor_links = []
            if donations.get("github_sponsors"):
                sponsor_links.append(f"[GitHub Sponsors]({donations['github_sponsors']})")
            if donations.get("buy_me_a_coffee"):
                sponsor_links.append(f"[Buy Me a Coffee]({donations['buy_me_a_coffee']})")
            if sponsor_links:
                entry += f"""
| **Sponsor** | {" · ".join(sponsor_links)} |"""

    entry += "\n\n---\n"
    return entry


def generate_readme(data: dict) -> str:
    """Generate full README.md content."""
    tools = data["tools"]
    categories = data["categories"]
    
    # Get sorted category order from the data
    category_order = get_sorted_categories(categories)
    
    # Group tools by category
    by_category = {}
    for tool in tools:
        cat = tool.get("category", "other")
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(tool)
    
    # Sort tools within each category by name
    for cat in by_category:
        by_category[cat].sort(key=lambda t: t["name"].lower())
    
    # Build TOC
    toc_items = []
    for cat in category_order:
        if cat in by_category:
            cat_name = categories[cat]["name"]
            anchor = cat_name.lower().replace(" & ", "--").replace(" ", "-")
            toc_items.append(f"- [{cat_name}](#{anchor})")
    toc_items.append("- [Contributing](#contributing)")
    toc = "\n".join(toc_items)
    
    # Build tool sections
    sections = []
    for cat in category_order:
        if cat in by_category:
            cat_name = categories[cat]["name"]
            section = f"## {cat_name}\n\n"
            for tool in by_category[cat]:
                section += generate_tool_entry(tool)
            sections.append(section)
    
    tools_content = "\n".join(sections)
    
    readme = f"""# Awesome In-Browser Security Tools

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

> A curated list of open-source information security tools that run entirely in your browser — no backend, no installation required.

## Philosophy

These tools embrace a client-side-first approach to security tooling:

- **Data Privacy** — No user data storage on servers
- **No Persistent API Keys** — Keys input as needed, never stored
- **No CORS Proxying** — Prevents third-party data interception
- **Client-Side Operations** — All processing happens in your browser
- **Transparent Hosting** — Open-source code hosted on GitHub Pages

Read more: [Making Security Tools Accessible: Why I Chose the Browser](https://blog.anantshri.info/making-security-tools-accessible-why-i-chose-the-browser/)

---

## Contents

{toc}

---

{tools_content}
## Contributing

Contributions are welcome! To add a new tool:

1. Fork this repository
2. Edit `data/tools.json` — add your tool entry
3. Submit a pull request

That's it! Our automation will validate your entry and update the README and website automatically.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the tool entry format and criteria.

---

## License

[![CC0](https://licensebuttons.net/p/zero/1.0/88x31.png)](https://creativecommons.org/publicdomain/zero/1.0/)

To the extent possible under law, the contributors have waived all copyright and related or neighboring rights to this work.

---

<sub>Last generated: {datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")}</sub>
"""
    return readme


def main():
    base_path = Path(__file__).parent.parent
    tools_path = base_path / "data" / "tools.json"
    readme_path = base_path / "README.md"

    with open(tools_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    readme_content = generate_readme(data)

    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(readme_content)

    print(f"README.md generated with {len(data['tools'])} tools")


if __name__ == "__main__":
    main()
