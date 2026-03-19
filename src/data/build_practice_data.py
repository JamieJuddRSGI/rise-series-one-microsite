"""
Utility to convert `sitedata.xlsx` into a TypeScript array of practice-area
ranking data.  Each practice area contains an array of per-lawyer scores for
the reputation and instruction indicators (which differ per practice area),
plus the composite total score.

Specialties from the spreadsheet are mapped to canonical practice areas:
    Private Equity / Private Credit / Venture Capital  ->  Private Capital
    (all others map directly)
"""

from __future__ import annotations

import json
import math
import re
from pathlib import Path
from typing import Dict, Iterable, List, Set, Union

import pandas as pd

EXCEL_PATH = Path(__file__).with_name("sitedata.xlsx")
OUTPUT_PATH = Path(__file__).with_name("rawPracticeData.ts")

# Canonical practice areas used on the site
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

# Column indices for the fields we extract
IDX_ID = 0
IDX_SPECIALTY = 3
IDX_TOTAL_SCORE = 6
IDX_REPUTATION_SCORE = 7
IDX_INSTRUCTION_SCORE = 8

# Reputation sub-scores (columns L-N, indices 11-13)
IDX_PEER_RECOMMENDATIONS = 11
IDX_DIRECTORY_RANKINGS = 12
IDX_MEDIA_PROFILE = 13

# Instruction sub-scores (columns O-Q, indices 14-16)
IDX_DEAL_VOLUME = 14
IDX_DEAL_VALUE = 15
IDX_CLIENTS = 16


def _is_nan(value: object) -> bool:
    return value is None or (isinstance(value, float) and math.isnan(value))


def _string(value: object) -> str:
    if _is_nan(value):
        return ""
    return str(value).strip()


def _number(value: object) -> Union[int, float]:
    if _is_nan(value):
        return 0
    if isinstance(value, (int, float)):
        num = float(value)
    else:
        cleaned = str(value).strip().replace(",", "")
        if not cleaned:
            return 0
        num = float(cleaned)
    if num.is_integer():
        return int(num)
    return round(num, 2)


def _parse_specialties(raw: object) -> List[str]:
    if _is_nan(raw):
        return []
    parts = re.split(r"[,/;|]", str(raw))
    specialties = [part.strip() for part in parts if part.strip()]
    return specialties or [str(raw).strip()]


def _map_to_practice_area(specialty: str) -> str:
    return SPECIALTY_TO_PRACTICE.get(specialty.lower(), specialty)


def build_practice_data(rows: Iterable[Iterable[object]]) -> List[dict]:
    practice_map: Dict[str, List[dict]] = {pa: [] for pa in PRACTICE_AREAS}
    seen: Dict[str, Set[str]] = {pa: set() for pa in PRACTICE_AREAS}

    for row in rows:
        values = list(row)
        if all(_is_nan(v) for v in values):
            continue

        lawyer_id = _string(values[IDX_ID])
        if not lawyer_id:
            continue

        specialties = _parse_specialties(values[IDX_SPECIALTY])
        practice_areas: Set[str] = set()
        for s in specialties:
            pa = _map_to_practice_area(s)
            if pa in practice_map:
                practice_areas.add(pa)

        if not practice_areas:
            practice_areas.add("Private Capital")

        entry = {
            "id": lawyer_id,
            "totalScore": _number(values[IDX_TOTAL_SCORE]),
            "reputationScore": _number(values[IDX_REPUTATION_SCORE]),
            "instructionScore": _number(values[IDX_INSTRUCTION_SCORE]),
            "peerRecommendations": _number(values[IDX_PEER_RECOMMENDATIONS]),
            "directoryRankings": _number(values[IDX_DIRECTORY_RANKINGS]),
            "mediaProfile": _number(values[IDX_MEDIA_PROFILE]),
            "dealVolume": _number(values[IDX_DEAL_VOLUME]),
            "dealValue": _number(values[IDX_DEAL_VALUE]),
            "clients": _number(values[IDX_CLIENTS]),
        }

        for pa in practice_areas:
            if lawyer_id not in seen[pa]:
                seen[pa].add(lawyer_id)
                practice_map[pa].append(entry)

    return [{"practiceArea": pa, "data": practice_map[pa]} for pa in PRACTICE_AREAS]


def emit_typescript(practice_data: List[dict]) -> str:
    def to_js(obj: object, indent: int = 0) -> str:
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
            items = [to_js(item, indent + 2) for item in obj]
            joined = ",\n".join(f"{' ' * (indent + 2)}{it}" for it in items)
            return "[\n" + joined + "\n" + ind + "]"
        if isinstance(obj, dict):
            if not obj:
                return "{}"
            items = []
            for k, v in obj.items():
                k_str = str(k)
                key_js = k_str if re.match(r"^[A-Za-z_$][A-Za-z0-9_$]*$", k_str) else to_js(k_str)
                items.append(f"{' ' * (indent + 2)}{key_js}: {to_js(v, indent + 2)}")
            return "{\n" + ",\n".join(items) + "\n" + ind + "}"
        return json.dumps(obj, ensure_ascii=False)

    return f"export const rawPracticeData = {to_js(practice_data, 0)};\n"


def main() -> None:
    if not EXCEL_PATH.exists():
        raise FileNotFoundError(f"Could not locate {EXCEL_PATH}")

    df = pd.read_excel(EXCEL_PATH, sheet_name=0)
    practice_data = build_practice_data(df.itertuples(index=False, name=None))

    OUTPUT_PATH.write_text(emit_typescript(practice_data), encoding="utf-8")
    total_entries = sum(len(d["data"]) for d in practice_data)
    print(f"Wrote {total_entries} lawyer scores across {len(PRACTICE_AREAS)} practice areas to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
