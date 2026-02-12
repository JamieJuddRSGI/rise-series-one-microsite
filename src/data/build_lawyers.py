"""
Utility to convert `sitedata.xlsx` (first worksheet) into a TypeScript
array of `Lawyer` objects that match the `Lawyer` interface declared in
`siteData.ts`.
"""

from __future__ import annotations

import json
import math
import re
from pathlib import Path
from typing import Iterable, List, Union

import pandas as pd

EXCEL_PATH = Path(__file__).with_name("sitedata.xlsx")
OUTPUT_PATH = Path(__file__).with_name("lawyerData.ts")

# Column indices based on the Excel formula shared by the user
IDX = {
    "id": 0,
    "name": 1,
    "firm": 2,
    "specialty": 3,
    "location": 4,
    "jobTitle": 5,
    "totalScore": 6,
    "reputationScore": 7,
    "instructionScore": 8,
    "sophisticationScore": 9,
    "experienceScore": 10,
    "bio": 30,
}

BREAKDOWN_FIELDS = [
    "peerRecommendations",
    "directoryRankings",
    "mediaProfile",
    "dealVolume",
    "dealValue",
    "clients",
    "aiAndTechnology",
    "dataDrivenPractice",
    "pricingModels",
    "valueAdds",
    "numberOfReferences",
    "expertise",
    "service",
    "commerciality",
    "communication",
    "eq",
    "strategy",
    "network",
    "leadership",
]
BREAKDOWN_OFFSET = 11  # Column L

RECENT_CASE_INDEXES = [
    (31, 32),  # title, slug
    (33, 34),
    (35, 36),
]
RECENT_CASE_URL_PREFIX = "https://resightindia.com/law-firms/indian/news/"


def _is_nan(value: object) -> bool:
    return value is None or (isinstance(value, float) and math.isnan(value))


def _string(value: object) -> str:
    if _is_nan(value):
        return ""
    return str(value).strip()


def _number(value: object) -> Union[int, float, None]:
    if _is_nan(value):
        return None
    if isinstance(value, (int, float)):
        num = float(value)
    else:
        cleaned = str(value).strip().replace(",", "")
        if not cleaned:
            return None
        num = float(cleaned)
    if num.is_integer():
        return int(num)
    # Round to 2 decimal places to avoid floating point precision issues
    return round(num, 2)


def _parse_specialties(raw: object) -> List[str]:
    if _is_nan(raw):
        return []
    parts = re.split(r"[,/;|]", str(raw))
    specialties = [part.strip() for part in parts if part.strip()]
    return specialties or [str(raw).strip()]


def _parse_bio(raw: object) -> List[str]:
    """Always return a list of paragraph strings for the bio.

    Empty / missing values return an empty list. Spreadsheet authors may
    separate paragraphs with double newlines or '||'.
    """
    if _is_nan(raw):
        return []
    text = str(raw).strip()
    if not text:
        return []
    segments = [seg.strip() for seg in re.split(r"(?:\n{2,}|\|\|)", text) if seg.strip()]
    if segments:
        return segments
    return [text]


def _build_recent_cases(row_values: List[object]) -> List[dict]:
    cases = []
    for title_idx, slug_idx in RECENT_CASE_INDEXES:
        title = _string(row_values[title_idx]) if title_idx < len(row_values) else ""
        slug = _string(row_values[slug_idx]) if slug_idx < len(row_values) else ""
        if not title or not slug:
            continue
        cases.append(
            {
                "title": title,
                "url": f"{RECENT_CASE_URL_PREFIX}{slug}",
            }
        )
    return cases


def _row_to_lawyer(row_values: List[object]) -> dict:
    lawyer = {
        "id": _string(row_values[IDX["id"]]),
        "name": _string(row_values[IDX["name"]]),
        "firm": _string(row_values[IDX["firm"]]),
        "specialty": _parse_specialties(row_values[IDX["specialty"]]),
        "location": _string(row_values[IDX["location"]]),
        "jobTitle": _string(row_values[IDX["jobTitle"]]),
        "totalScore": _number(row_values[IDX["totalScore"]]),
        "reputationScore": _number(row_values[IDX["reputationScore"]]),
        "instructionScore": _number(row_values[IDX["instructionScore"]]),
        "sophisticationScore": _number(row_values[IDX["sophisticationScore"]]),
        "experienceScore": _number(row_values[IDX["experienceScore"]]),
        "breakdown": {},
        "bio": _parse_bio(row_values[IDX["bio"]]),
    }

    breakdown = {}
    for offset, field in enumerate(BREAKDOWN_FIELDS):
        idx = BREAKDOWN_OFFSET + offset
        breakdown[field] = _number(row_values[idx]) if idx < len(row_values) else None
    lawyer["breakdown"] = breakdown

    # Always include the `recentCases` key; use an empty list when there
    # are no recent cases so TypeScript consumers can rely on the field.
    recent_cases = _build_recent_cases(row_values)
    lawyer["recentCases"] = recent_cases

    # Remove None values for cleanliness (TypeScript will allow undefined keys)
    for key in list(lawyer.keys()):
        if isinstance(lawyer[key], dict):
            lawyer[key] = {k: v for k, v in lawyer[key].items() if v is not None}
        elif lawyer[key] is None:
            lawyer.pop(key)

    return lawyer


def build_lawyers_array(rows: Iterable[Iterable[object]]) -> List[dict]:
    lawyers = []
    for row in rows:
        values = list(row)
        if all(_is_nan(value) for value in values):
            continue
        lawyers.append(_row_to_lawyer(values))
    return lawyers


def emit_typescript(lawyers: List[dict]) -> str:
    # Serialize Python objects to a JavaScript/TypeScript literal while
    # using single quotes for all string values. Keys are emitted as
    # single-quoted strings as well.
    def to_js(obj, indent: int = 0) -> str:
        ind = ' ' * indent
        if isinstance(obj, str):
            # Use json.dumps to get correct escaping for special characters
            inner = json.dumps(obj, ensure_ascii=False)
            inner = inner[1:-1]  # strip surrounding double quotes
            inner = inner.replace("'", "\\'")  # escape single quotes
            return f"'{inner}'"
        if isinstance(obj, bool):
            return 'true' if obj else 'false'
        if obj is None:
            return 'null'
        if isinstance(obj, (int, float)):
            return str(obj)
        if isinstance(obj, list):
            if not obj:
                return '[]'
            items = []
            for item in obj:
                items.append(to_js(item, indent + 2))
            joined = ",\n".join(f"{' '*(indent+2)}{it}" for it in items)
            return "[\n" + joined + "\n" + ind + "]"
        if isinstance(obj, dict):
            if not obj:
                return '{}'
            items = []
            # Emit keys without quotes when they are valid JS identifiers.
            def is_valid_identifier(s: str) -> bool:
                return re.match(r"^[A-Za-z_$][A-Za-z0-9_$]*$", s) is not None

            for k, v in obj.items():
                k_str = str(k)
                if is_valid_identifier(k_str):
                    key_js = k_str
                else:
                    key_js = to_js(k_str)
                val_js = to_js(v, indent + 2)
                items.append(f"{' '*(indent+2)}{key_js}: {val_js}")
            return "{\n" + ",\n".join(items) + "\n" + ind + "}"
        # Fallback to JSON for unknown types (shouldn't normally happen)
        return json.dumps(obj, ensure_ascii=False)

    array_literal = to_js(lawyers, 0)
    return (
        "import { Lawyer } from './siteData';\n\n"
        f"export const lawyers: Lawyer[] = {array_literal};\n"
    )


def main() -> None:
    if not EXCEL_PATH.exists():
        raise FileNotFoundError(f"Could not locate {EXCEL_PATH}")

    df = pd.read_excel(EXCEL_PATH, sheet_name=0)
    lawyers = build_lawyers_array(df.itertuples(index=False, name=None))

    OUTPUT_PATH.write_text(emit_typescript(lawyers), encoding="utf-8")
    print(f"Wrote {len(lawyers)} lawyers to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()

