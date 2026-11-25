#!/usr/bin/env python3
"""Container entrypoint: validate the mounted service config and start nginx.

Reads /config/services.yaml, validates it, writes the data as a small
JavaScript file into the nginx document root, then execs nginx.

The container fails to start (non-zero exit) when the config file is
missing, is invalid YAML, or does not match the expected schema.
"""

import json
import os
import sys
import tempfile
from pathlib import Path

import yaml

CONFIG_PATH = Path(os.environ.get("ABLHOME_CONFIG", "/config/services.yaml"))
DOCROOT = Path(os.environ.get("ABLHOME_DOCROOT", "/usr/share/nginx/html"))
OUTPUT_PATH = DOCROOT / "config" / "services.js"

REQUIRED_FIELDS = ("name", "url", "image")
OPTIONAL_FIELDS = ("group", "description", "description_de")


def fail(message: str) -> None:
    print(f"ablhome: config error: {message}", file=sys.stderr)
    sys.exit(1)


def load_config(path: Path) -> list[dict]:
    if not path.is_file():
        fail(f"config file not found at {path} (bind-mount it and restart the container)")

    try:
        with path.open("r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
    except yaml.YAMLError as e:
        fail(f"invalid YAML in {path}:\n{e}")

    if data is None:
        fail(f"config file {path} is empty")
    if not isinstance(data, dict) or "services" not in data:
        fail(f"config must be a mapping with a top-level 'services' list")

    services = data["services"]
    if not isinstance(services, list):
        fail("'services' must be a list")

    for i, entry in enumerate(services):
        if not isinstance(entry, dict):
            fail(f"services[{i}] must be a mapping")
        for field in REQUIRED_FIELDS:
            value = entry.get(field)
            if not isinstance(value, str) or not value.strip():
                fail(f"services[{i}].{field} is missing or empty (entry: {json.dumps(entry, default=str)[:200]})")
        # Optional fields must be strings when present (null/empty means "not set").
        for field in OPTIONAL_FIELDS:
            value = entry.get(field)
            if value is not None and not isinstance(value, str):
                fail(f"services[{i}].{field} must be a string when present")
        # Reject unknown fields to catch typos like 'imag'.
        unknown = set(entry) - set(REQUIRED_FIELDS) - set(OPTIONAL_FIELDS)
        if unknown:
            fail(f"services[{i}] has unknown fields: {', '.join(sorted(unknown))}")

    return services


def write_services_js(services: list[dict]) -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(services, ensure_ascii=False)
    # json.dumps output is valid JS for our flat string-only structure,
    # but escape any sequence that could break out of the string literal.
    payload = payload.replace("</", "<\\/")
    content = f"window.__SERVICES__ = {payload};\n"

    fd, tmp_path = tempfile.mkstemp(dir=OUTPUT_PATH.parent, prefix=".services.js.")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(content)
        # mkstemp creates the file 0600; nginx workers run unprivileged.
        os.chmod(tmp_path, 0o644)
        os.replace(tmp_path, OUTPUT_PATH)
    except BaseException:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
        raise


def main() -> None:
    services = load_config(CONFIG_PATH)
    write_services_js(services)
    print(f"ablhome: loaded {len(services)} service(s) from {CONFIG_PATH}")
    sys.stdout.flush()
    os.execvp("nginx", ["nginx", "-g", "daemon off;"])


if __name__ == "__main__":
    main()
