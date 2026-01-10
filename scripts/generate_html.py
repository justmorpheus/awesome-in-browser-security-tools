#!/usr/bin/env python3
"""
Generate/update docs/js/tools-data.js from tools.json
Embeds tool data directly in JS for file:// compatibility
"""

import json
from pathlib import Path


def main():
    base_path = Path(__file__).parent.parent
    tools_path = base_path / "data" / "tools.json"
    js_data_path = base_path / "docs" / "js" / "tools-data.js"

    with open(tools_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Generate JS file with embedded data
    js_content = f"""// Auto-generated from data/tools.json - DO NOT EDIT MANUALLY
// Run: python scripts/generate_html.py

window.TOOLS_DATA = {json.dumps(data, indent=2)};
"""

    with open(js_data_path, "w", encoding="utf-8") as f:
        f.write(js_content)

    print(f"docs/js/tools-data.js generated with {len(data['tools'])} tools")


if __name__ == "__main__":
    main()
