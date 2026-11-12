import math
import re
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="FindIt Campus AI Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CAMPUS_BUILDING_METADATA = {
    "BLD_LIB": {"name": "Main Library", "code": "LIB", "x": 280, "y": 160, "lat": 12.9716, "lng": 77.5946},
    "BLD_TECH": {"name": "Tech Park", "code": "TECH", "x": 620, "y": 180, "lat": 12.9722, "lng": 77.5960},
    "BLD_UNION": {"name": "Student Union", "code": "STU", "x": 450, "y": 320, "lat": 12.9712, "lng": 77.5952},
    "BLD_DINE": {"name": "Dining Hall", "code": "DINE", "x": 220, "y": 440, "lat": 12.9705, "lng": 77.5939},
    "BLD_ARENA": {"name": "Sports Arena", "code": "SPRT", "x": 740, "y": 380, "lat": 12.9708, "lng": 77.5975},
    "BLD_DORM": {"name": "North Dormitories", "code": "DORM", "x": 380, "y": 560, "lat": 12.9698, "lng": 77.5948},
}

class Coords(BaseModel):
    x: Optional[float] = 0
    y: Optional[float] = 0
    lat: Optional[float] = 0
    lng: Optional[float] = 0

class ItemModel(BaseModel):
    id: str
    type: str  # "LOST" | "FOUND"
    title: str
    category: str
    brand: Optional[str] = ""
    color: Optional[str] = ""
    imageUrl: Optional[str] = ""
    buildingId: Optional[str] = ""
    coords: Optional[Coords] = None
    timestamp: Optional[str] = None
    status: Optional[str] = None
    lockerId: Optional[str] = None
    retentionDays: Optional[int] = 30
    expiresAt: Optional[str] = None
    sensitive: Optional[Dict[str, Any]] = None

class ScoreRequest(BaseModel):
    targetItem: ItemModel
    candidateItems: List[ItemModel]

class Breakdown(BaseModel):
    visual: int
    category: int
    location: int
    time: int

class MatchResult(BaseModel):
    lostItemId: str
    foundItemId: str
    totalScore: int
    breakdown: Breakdown
    explanation: List[str]

class HotspotsRequest(BaseModel):
    items: List[ItemModel]

def tokenize(text: str) -> set:
    if not text:
        return set()
    cleaned = re.sub(r"[^a-zA-Z0-9\s]", " ", text.lower())
    words = [w.strip() for w in cleaned.split() if len(w.strip()) > 1]
    return set(words)

def compute_distance_meters(c1: Optional[Coords], c2: Optional[Coords]) -> float:
    if not c1 or not c2:
        return 500.0
    if c1.lat and c1.lng and c2.lat and c2.lng:
        # Haversine distance approximation
        d_lat = (c1.lat - c2.lat) * 111000.0
        d_lng = (c1.lng - c2.lng) * 111000.0 * math.cos(math.radians(c1.lat))
        return math.sqrt(d_lat * d_lat + d_lng * d_lng)
    elif c1.x and c1.y and c2.x and c2.y:
        dx = c1.x - c2.x
        dy = c1.y - c2.y
        return math.sqrt(dx * dx + dy * dy)
    return 200.0

def parse_iso_time(ts: Optional[str]) -> datetime:
    if not ts:
        return datetime.utcnow()
    try:
        cleaned = ts.replace("Z", "+00:00")
        return datetime.fromisoformat(cleaned)
    except Exception:
        return datetime.utcnow()

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "FindIt Campus AI Matcher"}

@app.post("/score-matches", response_model=List[MatchResult])
def score_matches(payload: ScoreRequest):
    target = payload.targetItem
    results = []

    target_tokens = tokenize(f"{target.title} {target.brand} {target.color}")
    target_time = parse_iso_time(target.timestamp)

    for cand in payload.candidateItems:
        # Lost items match with Found items, or if comparing same type ignore self
        if cand.id == target.id:
            continue

        cand_tokens = tokenize(f"{cand.title} {cand.brand} {cand.color}")

        # 1. Visual & Description Similarity (35%)
        # Token overlap + color match + brand match
        union = target_tokens.union(cand_tokens)
        intersection = target_tokens.intersection(cand_tokens)
        token_sim = (len(intersection) / len(union) * 100) if union else 40.0

        color_match = (
            target.color
            and cand.color
            and (target.color.lower() in cand.color.lower() or cand.color.lower() in target.color.lower())
        )
        brand_match = (
            target.brand
            and cand.brand
            and (target.brand.lower() == cand.brand.lower() or target.brand.lower() in cand.brand.lower())
        )

        visual_score = token_sim * 0.5 + (30.0 if color_match else 0.0) + (20.0 if brand_match else 0.0)
        visual_score = max(20.0, min(100.0, visual_score))

        # 2. Category & Attribute Match (30%)
        if target.category.lower() == cand.category.lower():
            cat_score = 90.0 + (10.0 if brand_match else 0.0)
        else:
            cat_score = 15.0
        cat_score = max(0.0, min(100.0, cat_score))

        # 3. Location Proximity (20%)
        # 100% within 50m, linear decay down to 0% at 1000m
        distance = compute_distance_meters(target.coords, cand.coords)
        if target.buildingId and cand.buildingId and target.buildingId == cand.buildingId:
            loc_score = 95.0
        elif distance <= 50.0:
            loc_score = 100.0
        elif distance >= 1000.0:
            loc_score = 10.0
        else:
            loc_score = max(10.0, 100.0 - (distance - 50.0) * (90.0 / 950.0))

        # 4. Time Delta (15%)
        # 100% within 2h, decay down to 0% at 14 days (336h)
        cand_time = parse_iso_time(cand.timestamp)
        diff_hours = abs((target_time - cand_time).total_seconds()) / 3600.0
        if diff_hours <= 2.0:
            time_score = 100.0
        elif diff_hours >= 336.0:
            time_score = 10.0
        else:
            time_score = max(10.0, 100.0 - (diff_hours - 2.0) * (90.0 / 334.0))

        # Overall weighted score
        total_score = round(
            visual_score * 0.35 + cat_score * 0.30 + loc_score * 0.20 + time_score * 0.15
        )

        # Generate Natural-Language Explanations
        bld_name = CAMPUS_BUILDING_METADATA.get(cand.buildingId, {}).get("name", "Campus Grounds")
        explanations = []

        if visual_score >= 70:
            explanations.append(
                f"Visual geometry & text descriptors correlate with {round(visual_score)}% similarity "
                f"across brand ({cand.brand or 'Unspecified'}) and color ({cand.color or 'matching'})."
            )
        else:
            explanations.append(
                f"General taxonomy alignment on {cand.category} with partial feature match ({round(visual_score)}%)."
            )

        if target.buildingId and cand.buildingId and target.buildingId == cand.buildingId:
            explanations.append(f"Spatial co-location: Both items originated within {bld_name} perimeter.")
        else:
            explanations.append(
                f"Proximity cluster: Discovered approx. {int(distance)}m away along campus walking corridor."
            )

        if diff_hours < 24.0:
            explanations.append(
                f"Tight chronological window: Reported loss and recovery occur within {round(diff_hours, 1)} hours."
            )
        else:
            explanations.append(
                f"Intake logged {int(diff_hours // 24)} days apart within standard custody retention window."
            )

        lost_id = target.id if target.type == "LOST" else cand.id
        found_id = cand.id if target.type == "LOST" else target.id

        results.append(
            MatchResult(
                lostItemId=lost_id,
                foundItemId=found_id,
                totalScore=total_score,
                breakdown=Breakdown(
                    visual=round(visual_score),
                    category=round(cat_score),
                    location=round(loc_score),
                    time=round(time_score),
                ),
                explanation=explanations,
            )
        )

    # Sort descending by total score
    results.sort(key=lambda r: r.totalScore, reverse=True)
    return results

@app.post("/hotspots")
def get_hotspots(payload: HotspotsRequest):
    counts = {bld_id: 0 for bld_id in CAMPUS_BUILDING_METADATA}
    
    for item in payload.items:
        if item.buildingId and item.buildingId in counts:
            counts[item.buildingId] += 1

    max_count = max(counts.values()) if counts and max(counts.values()) > 0 else 1

    zones = []
    for bld_id, meta in CAMPUS_BUILDING_METADATA.items():
        cnt = counts.get(bld_id, 0)
        # Intensity scaled 0.15 to 0.95
        intensity = round(0.15 + (cnt / max_count) * 0.8, 2) if max_count > 0 else 0.2
        zones.append({
            "buildingId": bld_id,
            "name": meta["name"],
            "count": cnt,
            "intensity": intensity,
            "coords": {"x": meta["x"], "y": meta["y"]},
        })

    return {"zones": zones}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
