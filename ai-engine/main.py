from __future__ import annotations

import math
import re
from collections import Counter
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="FindIt AI Engine")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScoreRequest(BaseModel):
    targetItem: Dict[str, Any]
    candidateItems: List[Dict[str, Any]] = Field(default_factory=list)


class HotspotRequest(BaseModel):
    items: List[Dict[str, Any]] = Field(default_factory=list)


def tokenize(item: Dict[str, Any]) -> List[str]:
    parts = [
        item.get("title", ""),
        item.get("category", ""),
        item.get("brand", ""),
        item.get("color", ""),
        item.get("description", ""),
    ]
    sensitive = item.get("sensitive") or {}
    if isinstance(sensitive, dict):
        parts.extend([str(v) for v in sensitive.values() if v and v != "REDACTED"])
    text = " ".join(str(p) for p in parts if p).lower()
    return re.findall(r"[a-z0-9]+", text)


def tfidf_cosine(a: List[str], b: List[str]) -> float:
    if not a or not b:
        return 0.0
    ca, cb = Counter(a), Counter(b)
    vocab = set(ca) | set(cb)
    dot = sum(ca[t] * cb[t] for t in vocab)
    na = math.sqrt(sum(v * v for v in ca.values()))
    nb = math.sqrt(sum(v * v for v in cb.values()))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def jaccard(a: List[str], b: List[str]) -> float:
    sa, sb = set(a), set(b)
    if not sa or not sb:
        return 0.0
    return len(sa & sb) / len(sa | sb)


def parse_time(value: Any) -> Optional[datetime]:
    if not value:
        return None
    if isinstance(value, (int, float)):
        try:
            return datetime.fromtimestamp(float(value) / 1000.0)
        except Exception:
            return None
    s = str(value)
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00")).replace(tzinfo=None)
    except Exception:
        pass
    for fmt in ("%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(s[:26], fmt)
        except Exception:
            continue
    return None


def coords(item: Dict[str, Any]):
    c = item.get("coords") or {}
    try:
        return float(c.get("x", 0)), float(c.get("y", 0)), c.get("lat"), c.get("lng")
    except Exception:
        return 0.0, 0.0, None, None


def haversine_m(lat1, lon1, lat2, lon2) -> float:
    R = 6371000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def location_score(target: Dict[str, Any], cand: Dict[str, Any]) -> float:
    tx, ty, tlat, tlng = coords(target)
    cx, cy, clat, clng = coords(cand)
    dist = None
    if tlat is not None and tlng is not None and clat is not None and clng is not None:
        try:
            dist = haversine_m(float(tlat), float(tlng), float(clat), float(clng))
        except Exception:
            dist = None
    if dist is None:
        dist = math.sqrt((tx - cx) ** 2 + (ty - cy) ** 2)
    if dist <= 50:
        return 100.0
    if dist >= 1000:
        return 0.0
    # smooth decay 50m->1000m
    return round(100.0 * (1 - (dist - 50) / 950) ** 1.2, 2)


def time_score(target: Dict[str, Any], cand: Dict[str, Any]) -> float:
    tt = parse_time(target.get("timestamp") or target.get("createdAt"))
    ct = parse_time(cand.get("timestamp") or cand.get("createdAt"))
    if not tt or not ct:
        return 40.0
    # penalize if found before reported lost
    t_type = (target.get("type") or "").upper()
    c_type = (cand.get("type") or "").upper()
    lost_t, found_t = (tt, ct) if t_type == "LOST" else (ct, tt) if c_type == "LOST" else (tt, ct)
    if found_t < lost_t:
        return 0.0
    delta_h = abs((ct - tt).total_seconds()) / 3600.0
    if delta_h <= 2:
        return 100.0
    max_h = 14 * 24
    if delta_h >= max_h:
        return 0.0
    return round(100.0 * (1 - (delta_h - 2) / (max_h - 2)) ** 1.1, 2)


def category_score(target: Dict[str, Any], cand: Dict[str, Any]) -> float:
    same_cat = (target.get("category") or "").lower() == (cand.get("category") or "").lower() and target.get("category")
    cat = 100.0 if same_cat else 0.0
    bt = tokenize({"brand": target.get("brand", ""), "title": target.get("title", "")})
    bc = tokenize({"brand": cand.get("brand", ""), "title": cand.get("title", "")})
    brand_sim = jaccard(bt, bc) * 100.0
    # exact category match + brand/model token similarity
    if same_cat:
        return round(min(100.0, 70.0 + 30.0 * (brand_sim / 100.0)), 2)
    return round(brand_sim * 0.4, 2)


def visual_score(target: Dict[str, Any], cand: Dict[str, Any]) -> float:
    ta, ca = tokenize(target), tokenize(cand)
    tfidf = tfidf_cosine(ta, ca) * 100.0
    # brand/color/visual-token cosine similarity emphasis
    visual_keys = ["brand", "color", "title", "category"]
    vt = tokenize({k: target.get(k, "") for k in visual_keys})
    vc = tokenize({k: cand.get(k, "") for k in visual_keys})
    vcos = tfidf_cosine(vt, vc) * 100.0
    return round(0.5 * tfidf + 0.5 * vcos, 2)


def build_explanations(target: Dict[str, Any], cand: Dict[str, Any], b: Dict[str, float]) -> List[str]:
    expl = []
    if b["visual"] >= 60:
        expl.append(f"Strong visual/description similarity ({b['visual']:.0f}%) based on brand, color, and item details.")
    elif b["visual"] >= 30:
        expl.append(f"Moderate visual similarity ({b['visual']:.0f}%) in item descriptors.")
    if b["category"] >= 70:
        expl.append(f"Category and attributes align well ({b['category']:.0f}%).")
    elif target.get("category") == cand.get("category"):
        expl.append("Same item category.")
    if b["location"] >= 70:
        expl.append(f"Reported/found very close on campus (location score {b['location']:.0f}%).")
    elif b["location"] >= 30:
        expl.append(f"Locations are within a plausible campus distance ({b['location']:.0f}%).")
    if b["time"] >= 70:
        expl.append(f"Timestamps are close in time ({b['time']:.0f}%).")
    elif b["time"] == 0 and parse_time(target.get("timestamp")) and parse_time(cand.get("timestamp")):
        expl.append("Time order suggests the found time may precede the loss report (penalized).")
    if not expl:
        expl.append("Low overall match based on available attributes.")
    return expl[:3]


@app.post("/score-matches")
def score_matches(payload: ScoreRequest):
    target = payload.targetItem or {}
    results = []
    for cand in payload.candidateItems or []:
        if cand.get("id") and target.get("id") and cand.get("id") == target.get("id"):
            continue
        b = {
            "visual": visual_score(target, cand),
            "category": category_score(target, cand),
            "location": location_score(target, cand),
            "time": time_score(target, cand),
        }
        total = round(
            b["visual"] * 0.35 + b["category"] * 0.30 + b["location"] * 0.20 + b["time"] * 0.15,
            2,
        )
        results.append(
            {
                "lostItemId": target.get("id") if target.get("type") == "LOST" else cand.get("id"),
                "foundItemId": cand.get("id") if target.get("type") == "LOST" else target.get("id"),
                "totalScore": max(0.0, min(100.0, total)),
                "breakdown": {
                    "visual": round(max(0.0, min(100.0, b["visual"]))),
                    "category": round(max(0.0, min(100.0, b["category"]))),
                    "location": round(max(0.0, min(100.0, b["location"]))),
                    "time": round(max(0.0, min(100.0, b["time"]))),
                },
                "explanation": build_explanations(target, cand, b),
            }
        )
    results.sort(key=lambda r: r["totalScore"], reverse=True)
    return results


BUILDING_NAMES = {
    "LIB": "Main Library",
    "ENG": "Engineering Block",
    "CAF": "Central Cafeteria",
    "HOST": "Hostel Complex",
    "GYM": "Sports Center",
    "ADMIN": "Admin Building",
    "LAB": "Science Labs",
    "AUD": "Auditorium",
    "PARK": "Parking Area",
}


@app.post("/hotspots")
def hotspots(payload: HotspotRequest):
    counts: Dict[str, int] = {}
    for item in payload.items or []:
        bid = item.get("buildingId") or "UNKNOWN"
        counts[bid] = counts.get(bid, 0) + 1
    maxc = max(counts.values()) if counts else 1
    zones = []
    for bid, count in sorted(counts.items(), key=lambda kv: kv[1], reverse=True):
        zones.append(
            {
                "buildingId": bid,
                "name": BUILDING_NAMES.get(bid, f"Building {bid}"),
                "count": count,
                "intensity": round(count / maxc, 4) if maxc else 0.0,
            }
        )
    return {"zones": zones}


@app.get("/")
def root():
    return {"status": "ok", "service": "findit-ai-engine"}
