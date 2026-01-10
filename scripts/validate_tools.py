#!/usr/bin/env python3
"""
Validate tools.json format and content.
Exit code 0 = valid, non-zero = invalid
"""

import json
import sys
import re
from pathlib import Path

REQUIRED_TOOL_FIELDS = {
    "name": str,
    "author": str,
    "repo": str,
    "demo": str,
    "description": str,
    "keywords": list,
    "category": str,
}

OPTIONAL_TOOL_FIELDS = {
    "donations": (str, dict, type(None)),
    "browserFeatures": list,
    "license": str,
}

REQUIRED_CATEGORY_FIELDS = {
    "name": str,
}

OPTIONAL_CATEGORY_FIELDS = {
    "description": str,
    "order": int,
}

URL_PATTERN = re.compile(r'^https?://[^\s]+$')


def validate_url(url: str, field_name: str) -> list:
    """Validate URL format."""
    errors = []
    if not URL_PATTERN.match(url):
        errors.append(f"Invalid URL format for '{field_name}': {url}")
    return errors


def validate_categories(categories: dict) -> list:
    """Validate categories structure."""
    errors = []
    
    if not isinstance(categories, dict):
        errors.append("'categories' must be an object")
        return errors
    
    if len(categories) == 0:
        errors.append("'categories' must contain at least one category")
        return errors
    
    for cat_id, cat_data in categories.items():
        if not isinstance(cat_data, dict):
            errors.append(f"Category '{cat_id}' must be an object")
            continue
        
        # Check required fields
        for field, expected_type in REQUIRED_CATEGORY_FIELDS.items():
            if field not in cat_data:
                errors.append(f"Category '{cat_id}' missing required field: '{field}'")
            elif not isinstance(cat_data[field], expected_type):
                errors.append(f"Category '{cat_id}' field '{field}' must be {expected_type.__name__}")
        
        # Check optional fields
        for field, expected_type in OPTIONAL_CATEGORY_FIELDS.items():
            if field in cat_data and not isinstance(cat_data[field], expected_type):
                errors.append(f"Category '{cat_id}' field '{field}' must be {expected_type.__name__}")
    
    return errors


def validate_tool(tool: dict, index: int, valid_categories: set) -> list:
    """Validate a single tool entry."""
    errors = []
    tool_name = tool.get("name", f"Tool at index {index}")

    # Check required fields
    for field, expected_type in REQUIRED_TOOL_FIELDS.items():
        if field not in tool:
            errors.append(f"[{tool_name}] Missing required field: '{field}'")
        elif not isinstance(tool[field], expected_type):
            errors.append(f"[{tool_name}] Field '{field}' must be {expected_type.__name__}")

    # Validate URLs
    if "repo" in tool and isinstance(tool["repo"], str):
        errors.extend(validate_url(tool["repo"], f"{tool_name}.repo"))
    if "demo" in tool and isinstance(tool["demo"], str):
        errors.extend(validate_url(tool["demo"], f"{tool_name}.demo"))

    # Validate category against defined categories
    if "category" in tool and tool["category"] not in valid_categories:
        errors.append(f"[{tool_name}] Invalid category '{tool['category']}'. Must be one of: {valid_categories}")

    # Validate keywords is non-empty list of strings
    if "keywords" in tool and isinstance(tool["keywords"], list):
        if len(tool["keywords"]) == 0:
            errors.append(f"[{tool_name}] Keywords must contain at least one entry")
        for kw in tool["keywords"]:
            if not isinstance(kw, str):
                errors.append(f"[{tool_name}] All keywords must be strings")
                break

    # Validate optional fields types
    for field, expected_type in OPTIONAL_TOOL_FIELDS.items():
        if field in tool:
            if isinstance(expected_type, tuple):
                if not isinstance(tool[field], expected_type):
                    errors.append(f"[{tool_name}] Field '{field}' has invalid type")
            elif not isinstance(tool[field], expected_type):
                errors.append(f"[{tool_name}] Field '{field}' must be {expected_type.__name__}")

    # Validate browserFeatures if present
    if "browserFeatures" in tool and isinstance(tool["browserFeatures"], list):
        for feat in tool["browserFeatures"]:
            if not isinstance(feat, str):
                errors.append(f"[{tool_name}] All browserFeatures must be strings")
                break

    return errors


def validate_tools_json(data: dict) -> list:
    """Validate the entire tools.json structure."""
    errors = []

    # Check for categories first
    if "categories" not in data:
        errors.append("Missing 'categories' object in JSON")
        return errors
    
    cat_errors = validate_categories(data["categories"])
    errors.extend(cat_errors)
    
    valid_categories = set(data["categories"].keys()) if isinstance(data["categories"], dict) else set()

    # Check tools array
    if "tools" not in data:
        errors.append("Missing 'tools' array in JSON")
        return errors

    if not isinstance(data["tools"], list):
        errors.append("'tools' must be an array")
        return errors

    if len(data["tools"]) == 0:
        errors.append("'tools' array must contain at least one tool")
        return errors

    # Validate each tool
    seen_names = set()
    for i, tool in enumerate(data["tools"]):
        if not isinstance(tool, dict):
            errors.append(f"Tool at index {i} must be an object")
            continue

        tool_errors = validate_tool(tool, i, valid_categories)
        errors.extend(tool_errors)

        # Check for duplicate names
        name = tool.get("name", "").lower()
        if name in seen_names:
            errors.append(f"Duplicate tool name: '{tool.get('name')}'")
        seen_names.add(name)

    return errors


def main():
    tools_path = Path(__file__).parent.parent / "data" / "tools.json"

    if not tools_path.exists():
        print(f"ERROR: {tools_path} not found")
        sys.exit(1)

    try:
        with open(tools_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON syntax: {e}")
        sys.exit(1)

    errors = validate_tools_json(data)

    if errors:
        print("Validation FAILED:")
        for error in errors:
            print(f"  - {error}")
        sys.exit(1)
    else:
        tool_count = len(data.get('tools', []))
        cat_count = len(data.get('categories', {}))
        print(f"Validation PASSED: {tool_count} tools, {cat_count} categories validated successfully")
        sys.exit(0)


if __name__ == "__main__":
    main()
