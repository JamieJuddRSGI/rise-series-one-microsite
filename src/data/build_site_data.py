"""
Unified build script that reads two CSV files:
  - RISE_lawyers.csv      -> lawyerData.ts  (BaseLawyer[])
  - RISE_PracticeData.csv -> rawPracticeData.ts (PracticeData[])

After generation it reports any Resight IDs that appear in one file
but not the other, to flag data mismatches.
"""

from __future__ import annotations

import json
import math
import re
import sys
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Set, Union

import pandas as pd

DATA_DIR = Path(__file__).parent
LAWYERS_CSV = DATA_DIR / "RISE_lawyers.csv"
PRACTICE_CSV = DATA_DIR / "RISE_PracticeData.csv"
LAWYERS_OUT = DATA_DIR / "lawyerData.ts"
PRACTICE_OUT = DATA_DIR / "rawPracticeData.ts"

RECENT_CASE_URL_PREFIX = "https://resightindia.com/law-firms/indian/news/"

PRACTICE_AREAS = [
    "Private Capital",
    "Arbitration",
    "Equity Capital Markets",
    "Debt Capital Markets",
    "Competition",
    "Cyber",
    "Infrastructure",
    "International Trade",
]

SPECIALTY_TO_PRACTICE: Dict[str, str] = {
    "private equity": "Private Capital",
    "private credit": "Private Capital",
    "venture capital": "Private Capital",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _is_nan(value: object) -> bool:
    return value is None or (isinstance(value, float) and math.isnan(value))


def _string(value: object) -> str:
    if _is_nan(value):
        return ""
    return str(value).strip()


def _number(value: object, default: Union[int, float, None] = None) -> Union[int, float, None]:
    if _is_nan(value):
        return default
    s = str(value).strip().replace(",", "")
    if not s or s == "-":
        return default
    num = float(s)
    if num.is_integer():
        return int(num)
    return round(num, 2)


def _parse_bio(raw: object) -> List[str]:
    if _is_nan(raw):
        return []
    text = str(raw).strip()
    if not text:
        return []
    segments = [seg.strip() for seg in re.split(r"(?:\n{2,}|\|\|)", text) if seg.strip()]
    return segments if segments else [text]


def _map_practice_area(raw: str) -> str:
    return SPECIALTY_TO_PRACTICE.get(raw.strip().lower(), raw.strip())


# ---------------------------------------------------------------------------
# Lawyer builder  (RISE_lawyers.csv)
# ---------------------------------------------------------------------------

def build_lawyers(df: pd.DataFrame) -> List[dict]:
    """Build deduplicated lawyer profiles, merging practice-area rows into one
    entry per Resight ID."""
    lawyers_by_id: Dict[str, dict] = {}
    specialties_by_id: Dict[str, List[str]] = defaultdict(list)

    for _, row in df.iterrows():
        rid = _string(row.get("Resight ID", ""))
        if not rid:
            continue

        practice_area = _map_practice_area(_string(row.get("Rankings", "")))
        if practice_area and practice_area not in specialties_by_id[rid]:
            specialties_by_id[rid].append(practice_area)

        if rid in lawyers_by_id:
            continue

        cases: List[dict] = []
        for i in range(1, 4):
            title = _string(row.get(f"CaseTitle{i}", ""))
            slug = _string(row.get(f"CaseSlug{i}", ""))
            if title and slug:
                cases.append({"title": title, "url": f"{RECENT_CASE_URL_PREFIX}{slug}"})

        lawyer: dict = {
            "id": rid,
            "name": _string(row.get("Name", "")),
            "firm": _string(row.get("Organisation", "")),
            "specialty": [],  # filled after loop
            "location": _string(row.get("Location", "")),
            "jobTitle": _string(row.get("Position", "")),
            "sophisticationScore": _number(row.get("Sophistication score"), 0),
            "experienceScore": _number(row.get("Experience score"), 0),
            "breakdown": {
                "techAndData": _number(row.get("S Tech and data"), 0),
                "pricing": _number(row.get("S Pricing"), 0),
                "talentDevelopment": _number(row.get("S Talent development"), 0),
                "numberOfReferences": _number(row.get("numberOfReferences"), 0),
                "service": _number(row.get("E Service"), 0),
                "expertise": _number(row.get("E Expertise"), 0),
                "commerciality": _number(row.get("E Commerciality"), 0),
                "communication": _number(row.get("E Communication"), 0),
                "eq": _number(row.get("E EQ"), 0),
                "strategy": _number(row.get("E Strategy"), 0),
                "network": _number(row.get("E Network"), 0),
                "leadership": _number(row.get("E Leadership"), 0),
            },
            "bio": _parse_bio(row.get("Bio", "")),
            "recentCases": cases,
        }

        lawyers_by_id[rid] = lawyer

    for rid, lawyer in lawyers_by_id.items():
        lawyer["specialty"] = specialties_by_id[rid]

    return list(lawyers_by_id.values())


# ---------------------------------------------------------------------------
# Practice-data builder  (RISE_PracticeData.csv)
# ---------------------------------------------------------------------------

def build_practice_data(df: pd.DataFrame) -> List[dict]:
    practice_map: Dict[str, List[dict]] = {pa: [] for pa in PRACTICE_AREAS}
    seen: Dict[str, Set[str]] = {pa: set() for pa in PRACTICE_AREAS}

    for _, row in df.iterrows():
        rid = _string(row.get("Resight ID", ""))
        if not rid:
            continue

        pa = _map_practice_area(_string(row.get("Ranking", "")))
        if pa not in practice_map:
            continue

        if rid in seen[pa]:
            continue
        seen[pa].add(rid)

        entry = {
            "id": rid,
            "totalScore": _number(row.get("Total"), 0),
            "reputationScore": _number(row.get("Reputation score"), 0),
            "peers": _number(row.get("R Peers"), 0),
            "directories": _number(row.get("R Directories"), 0),
            "newsMedia": _number(row.get("R News media"), 0),
            "socialMedia": _number(row.get("R Social media"), 0),
            "instructionScore": _number(row.get("Instructions score"), 0),
            "volume": _number(row.get("I Volume"), 0),
            "value": _number(row.get("I Value"), 0),
            "clients": _number(row.get("I Clients"), 0),
            "complexity": _number(row.get("I Complexity"), 0),
        }
        practice_map[pa].append(entry)

    return [{"practiceArea": pa, "data": practice_map[pa]} for pa in PRACTICE_AREAS]


# ---------------------------------------------------------------------------
# TypeScript emitter
# ---------------------------------------------------------------------------

def _to_js(obj: object, indent: int = 0) -> str:
    ind = " " * indent
    if isinstance(obj, str):
        inner = json.dumps(obj, ensure_ascii=False)[1:-1]
        inner = inner.replace("'", "\\'")
        return f"'{inner}'"
    if isinstance(obj, bool):
        return "true" if obj else "false"
    if obj is None:
        return "null"
    if isinstance(obj, (int, float)):
        return str(obj)
    if isinstance(obj, list):
        if not obj:
            return "[]"
        items = [_to_js(item, indent + 2) for item in obj]
        joined = ",\n".join(f"{' ' * (indent + 2)}{it}" for it in items)
        return "[\n" + joined + "\n" + ind + "]"
    if isinstance(obj, dict):
        if not obj:
            return "{}"
        items = []
        for k, v in obj.items():
            k_str = str(k)
            key_js = k_str if re.match(r"^[A-Za-z_$][A-Za-z0-9_$]*$", k_str) else _to_js(k_str)
            items.append(f"{' ' * (indent + 2)}{key_js}: {_to_js(v, indent + 2)}")
        return "{\n" + ",\n".join(items) + "\n" + ind + "}"
    return json.dumps(obj, ensure_ascii=False)


def emit_lawyers_ts(lawyers: List[dict]) -> str:
    return (
        "import { BaseLawyer } from './siteData';\n\n"
        f"export const lawyers: BaseLawyer[] = {_to_js(lawyers, 0)};\n"
    )


def emit_practice_ts(practice_data: List[dict]) -> str:
    return f"export const rawPracticeData = {_to_js(practice_data, 0)};\n"


# ---------------------------------------------------------------------------
# Mismatch reporting
# ---------------------------------------------------------------------------

def report_mismatches(lawyer_ids: Set[str], practice_ids: Set[str]) -> None:
    profile_only = lawyer_ids - practice_ids
    practice_only = practice_ids - lawyer_ids

    if not profile_only and not practice_only:
        print("  All IDs match between the two files.")
        return

    if profile_only:
        print(f"\n  WARNING: {len(profile_only)} lawyer(s) have a profile but NO practice data:")
        for rid in sorted(profile_only):
            print(f"    - {rid}")

    if practice_only:
        print(f"\n  WARNING: {len(practice_only)} ID(s) have practice data but NO profile:")
        for rid in sorted(practice_only):
            print(f"    - {rid}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    for path in (LAWYERS_CSV, PRACTICE_CSV):
        if not path.exists():
            print(f"ERROR: Could not locate {path}", file=sys.stderr)
            sys.exit(1)

    lawyers_df = pd.read_csv(LAWYERS_CSV)
    practice_df = pd.read_csv(PRACTICE_CSV)

    lawyers = build_lawyers(lawyers_df)
    practice_data = build_practice_data(practice_df)

    LAWYERS_OUT.write_text(emit_lawyers_ts(lawyers), encoding="utf-8")
    print(f"Wrote {len(lawyers)} lawyers to {LAWYERS_OUT}")

    total_entries = sum(len(d["data"]) for d in practice_data)
    PRACTICE_OUT.write_text(emit_practice_ts(practice_data), encoding="utf-8")
    print(f"Wrote {total_entries} practice-area entries across {len(PRACTICE_AREAS)} areas to {PRACTICE_OUT}")

    lawyer_ids = {l["id"] for l in lawyers}
    practice_ids: Set[str] = set()
    for pa in practice_data:
        for entry in pa["data"]:
            practice_ids.add(entry["id"])

    print("\n--- ID Mismatch Report ---")
    report_mismatches(lawyer_ids, practice_ids)
    print()


if __name__ == "__main__":
    main()
