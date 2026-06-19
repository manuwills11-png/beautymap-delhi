import csv
import os
import time
import re

from dotenv import load_dotenv
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
from supabase import create_client

load_dotenv()
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_ANON_KEY = os.environ["SUPABASE_ANON_KEY"]

INPUT_CSV = r"c:\BeautyMap\data\delhi_bridal_salons.csv"

geolocator = Nominatim(user_agent="beautymap_supabase_seed_v1")

NOISE = re.compile(
    r'\b(near|opposite|next to|opp\.?|adj\.?|behind|above|below|'
    r'ground floor|first floor|second floor|third floor|\d+(st|nd|rd|th) floor|'
    r'basement|ugf|lgf|shop no\.?|shop #|flat no\.?)\b',
    re.IGNORECASE,
)

KNOWN_AREAS = [
    "Shahpur Jat", "Karol Bagh", "Chandni Chowk", "Rajouri Garden",
    "Lajpat Nagar", "South Extension", "Pitam Pura", "Pitampura",
    "Mayur Vihar", "Old Delhi", "Kinari Bazar", "Siri Fort",
    "Hauz Khas", "Sarojini Nagar", "Connaught Place", "Janakpuri",
    "Dwarka", "Rohini", "Vasant Kunj", "Greater Kailash",
    "Defence Colony", "Green Park", "Safdarjung",
]


def extract_pincode(text):
    m = re.search(r'\b1[01]\d{4}\b', text)
    return m.group(0) if m else None


def extract_area(salon_name, raw_address):
    # Check known areas first (case-insensitive)
    for area in KNOWN_AREAS:
        if re.search(re.escape(area), raw_address, re.IGNORECASE):
            return area

    # Strip salon name from front
    stripped = raw_address
    if raw_address.startswith(salon_name):
        stripped = raw_address[len(salon_name):].lstrip(', ')

    # Walk backward through comma-parts to find the first non-generic token
    skip = {'india', 'delhi', 'new delhi'}
    parts = [p.strip() for p in stripped.split(',')]
    for part in reversed(parts):
        low = part.lower()
        if low in skip or re.match(r'^\d{6}$', part) or re.match(r'^\d', part):
            continue
        if re.search(r'\b(floor|basement|ugf|shop|flat|block|near|opp|market marg)\b', low):
            continue
        if len(part) > 3:
            return part.title()

    return None


def geocode_with_fallback(salon_name, raw_address):
    pincode = extract_pincode(raw_address)

    stripped = raw_address
    if raw_address.startswith(salon_name):
        stripped = raw_address[len(salon_name):].lstrip(', ').strip()

    cleaned = NOISE.sub('', stripped)
    cleaned = re.sub(r',\s*,', ',', cleaned).strip(', ')

    # Area + pincode fallback
    area = extract_area(salon_name, raw_address)
    area_query = f"{area}, Delhi {pincode}, India" if area and pincode else None
    pincode_query = f"Delhi {pincode}, India" if pincode else None

    queries = [q for q in [stripped, cleaned, area_query, pincode_query] if q]
    seen, unique = set(), []
    for q in queries:
        if q not in seen:
            seen.add(q)
            unique.append(q)

    for query in unique:
        try:
            loc = geolocator.geocode(query, timeout=10)
            if loc:
                return loc.latitude, loc.longitude
            time.sleep(0.2)
        except GeocoderTimedOut:
            time.sleep(1)
        except GeocoderServiceError as e:
            print(f"    Geocoder service error: {e}")
            break

    return None, None


def price_tier(review_count):
    if review_count is None:
        return "budget"
    if review_count > 1000:
        return "premium"
    if review_count >= 400:
        return "mid"
    return "budget"


def safe_int(val):
    try:
        return int(val) if val and str(val).strip() else None
    except (ValueError, TypeError):
        return None


def safe_float(val):
    try:
        return float(val) if val and str(val).strip() else None
    except (ValueError, TypeError):
        return None


# ── Load CSV ──────────────────────────────────────────────────────────────────
with open(INPUT_CSV, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

print(f"Loaded {len(rows)} salons from CSV")

# ── Connect to Supabase ───────────────────────────────────────────────────────
supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# ── Process and insert ────────────────────────────────────────────────────────
inserted = 0
failures = []

for i, row in enumerate(rows, 1):
    salon_name = row.get('Salon Name', '').strip()
    raw_address = row.get('Address', '').strip()
    phone = row.get('Phone', '').strip() or None
    website = row.get('Website', '').strip() or None
    rating = safe_float(row.get('Rating'))
    review_count = safe_int(row.get('Review Count'))
    photo_url = row.get('Photo URL', '').strip() or None
    categories = row.get('Shop Categories', '').strip()

    print(f"[{i}/{len(rows)}] {salon_name[:55]}...")

    # Geocode
    lat, lng = geocode_with_fallback(salon_name, raw_address)
    if lat is None:
        reason = "geocoding failed"
        print(f"  SKIP — {reason}")
        failures.append((salon_name, reason))
        if i < len(rows):
            time.sleep(0.5)
        continue

    area = extract_area(salon_name, raw_address)
    tier = price_tier(review_count)
    specialities = [s.strip() for s in categories.split(',') if s.strip()] or None
    photos = [photo_url] if photo_url else None

    record = {
        "name": salon_name,
        "area": area,
        "address": raw_address,
        "latitude": round(lat, 6),
        "longitude": round(lng, 6),
        "phone": phone,
        "website": website,
        "rating": rating,
        "review_count": review_count,
        "price_tier": tier,
        "specialities": specialities,
        "photos": photos,
        "description": None,
        "bridal_packages": None,
    }

    try:
        supabase.table("salons").insert(record).execute()
        inserted += 1
        print(f"  OK lat={lat:.4f} lng={lng:.4f} area={area} tier={tier}")
    except Exception as e:
        reason = str(e)
        print(f"  INSERT FAILED — {reason}")
        failures.append((salon_name, reason))

    if i < len(rows):
        time.sleep(0.5)

# ── Summary ───────────────────────────────────────────────────────────────────
print("\n" + "=" * 55)
print("SEEDING SUMMARY")
print("=" * 55)
print(f"  Total salons:      {len(rows)}")
print(f"  Successfully seeded: {inserted}")
print(f"  Failed:            {len(failures)}")
if failures:
    print("\n  Failures:")
    for name, reason in failures:
        print(f"    - {name}: {reason}")
print(f"\nSuccessfully seeded {inserted} salons into Supabase")
