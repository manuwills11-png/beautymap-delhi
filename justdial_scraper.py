"""
JustDial Review Scraper — Search by Salon Name
================================================
Requires: pip install curl_cffi beautifulsoup4

Usage (by name):
    python justdial_scraper.py "Lakme Salon"
    python justdial_scraper.py "Naturals Salon" --branches 3
    python justdial_scraper.py "Lakme Salon" --area "South Extension"

Usage (by URL, as before):
    python justdial_scraper.py "https://www.justdial.com/..."

Appends to all_reviews.csv: salon_name, area, reviewer, rating, date, review_text
"""

import csv
import json
import math
import sys
import time
import argparse
import re
from datetime import datetime, timezone
from pathlib import Path

from curl_cffi import requests as cf
from bs4 import BeautifulSoup


OUTPUT_CSV = Path("all_reviews.csv")
CSV_FIELDS = ["salon_name", "area", "reviewer", "rating", "date", "review_text"]
WIN_API    = "https://win.justdial.com/01sep2022/getRating.php"
JD_BASE    = "https://www.justdial.com"
PAGE_SIZE  = 10

BROWSE_HDR = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-IN,en;q=0.9",
    "Referer": "https://www.google.com/",
}
API_HDR = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-IN,en;q=0.9",
}


def _ms_to_date(epoch_ms: int) -> str:
    try:
        return datetime.fromtimestamp(epoch_ms / 1000, tz=timezone.utc).strftime("%d %b %Y")
    except Exception:
        return "N/A"


def _fetch(sess: cf.Session, url: str, headers: dict, retries: int = 4) -> cf.Response | None:
    for attempt in range(retries):
        try:
            r = sess.get(url, headers=headers, timeout=40)
            if r.status_code == 200 and len(r.text) > 1000:
                return r
        except Exception as e:
            print(f"  [!] Attempt {attempt+1}: {e}")
        time.sleep(3 * (attempt + 1))
    return None


def _search_listings(sess: cf.Session, name: str, area_filter: str = "") -> list[dict]:
    """Search JustDial Delhi for salon name, return list of {name, area, docid, rating, total_reviews}."""
    slug = re.sub(r"\s+", "-", name.strip())
    url  = f"{JD_BASE}/Delhi/{slug}"
    print(f"[*] Searching: {url}")
    r = _fetch(sess, url, BROWSE_HDR)
    if not r:
        return []

    soup = BeautifulSoup(r.text, "html.parser")
    nd_tag = soup.find("script", id="__NEXT_DATA__")
    if not nd_tag:
        return []

    nd      = json.loads(nd_tag.string)
    results = nd["props"]["pageProps"].get("listData", {}).get("results", {})
    cols    = results.get("columns", [])
    data    = results.get("data", [])

    listings = []
    for row in data:
        item = dict(zip(cols, row))
        docid = item.get("docid", "")
        if not docid:
            continue
        salon_name   = str(item.get("name", name))
        area         = str(item.get("area", ""))
        rating       = str(item.get("compRating", ""))
        total_reviews= str(item.get("totalReviews", ""))

        # Filter by area substring if requested
        if area_filter and area_filter.lower() not in area.lower():
            continue

        listings.append({
            "name":   salon_name,
            "area":   area,
            "docid":  docid,
            "rating": rating,
            "total":  total_reviews,
        })

    return listings


def _scrape_reviews(sess: cf.Session, listing: dict, listing_url: str) -> list[dict]:
    """Fetch all review pages for one listing and return row dicts."""
    docid = listing["docid"]
    salon = listing["name"]
    area  = listing["area"]

    # Get total count from the first API call
    d0 = None
    for attempt in range(4):
        try:
            resp = sess.get(
                WIN_API,
                params={"docid": docid, "np": 1, "ps": PAGE_SIZE},
                headers={**API_HDR, "Referer": listing_url},
                timeout=30,
            )
            if resp.status_code == 200:
                parsed = resp.json()
                if isinstance(parsed, dict):
                    d0 = parsed
                    break
        except Exception:
            pass
        time.sleep(3 * (attempt + 1))

    if d0 is None:
        print(f"  API returned unexpected format — skipping")
        return []

    data_block = d0.get("data", {})
    if isinstance(data_block, list):
        # API returned ratings list directly under "data"
        total = len(data_block)
    elif isinstance(data_block, dict):
        total = int(data_block.get("count", 0))
    else:
        total = 0

    if not total:
        print(f"  No reviews found for this listing")
        return []

    n_pages = math.ceil(min(total, 9999) / PAGE_SIZE)
    print(f"  {total} reviews across {n_pages} pages")

    seen: set[str] = set()
    rows: list[dict] = []

    for np in range(1, n_pages + 1):
        if np > 1:
            time.sleep(1.2)
        print(f"  Page {np}/{n_pages}...", end=" ", flush=True)

        if np == 1:
            batch_data = d0
        else:
            batch_data = None
            for attempt in range(3):
                try:
                    resp = sess.get(
                        WIN_API,
                        params={"docid": docid, "np": np, "ps": PAGE_SIZE},
                        headers={**API_HDR, "Referer": listing_url},
                        timeout=30,
                    )
                    if resp.status_code == 200:
                        parsed = resp.json()
                        if isinstance(parsed, dict):
                            batch_data = parsed
                            break
                except Exception:
                    time.sleep(2)
            if batch_data is None:
                print("FAILED")
                continue

        bd = batch_data.get("data", {})
        ratings = bd if isinstance(bd, list) else (bd.get("rating", []) if isinstance(bd, dict) else [])
        if not ratings:
            print("empty — stopping")
            break

        added = 0
        for rv in ratings:
            key = f"{rv.get('name','')}|{rv.get('age','')}|{str(rv.get('rev',''))[:30]}"
            if key in seen:
                continue
            seen.add(key)
            rows.append({
                "salon_name":  rv.get("compname", salon),
                "area":        area,
                "reviewer":    rv.get("name", "Anonymous") or "Anonymous",
                "rating":      str(rv.get("rating", "")),
                "date":        _ms_to_date(rv.get("age", 0)),
                "review_text": (rv.get("rev", "") or "").replace("\n", " ").strip(),
            })
            added += 1

        print(f"{added} new  (total: {len(rows)})")
        if added == 0 and np > 1:
            print("  No new reviews on this page — stopping early")
            break

    return rows


def _append_csv(rows: list[dict]) -> None:
    if not rows:
        return
    write_header = not OUTPUT_CSV.exists()
    with open(OUTPUT_CSV, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
        if write_header:
            writer.writeheader()
        writer.writerows(rows)


def scrape_by_name(name: str, branches: int = 1, area_filter: str = "") -> int:
    """Search Delhi for salon name and scrape up to `branches` locations."""
    sess = cf.Session(impersonate="chrome")
    # Warm session
    sess.get(JD_BASE, headers=BROWSE_HDR, timeout=20)
    time.sleep(1)

    listings = _search_listings(sess, name, area_filter)
    if not listings:
        print(f"[!] No listings found for '{name}' in Delhi.")
        return 0

    print(f"[+] Found {len(listings)} branches. Scraping top {branches}:\n")
    for i, listing in enumerate(listings[:branches]):
        print(f"--- Branch {i+1}: {listing['name']} | {listing['area']} | Rating: {listing['rating']} | {listing['total']} ---")
        slug = re.sub(r"\s+", "-", listing["name"])
        area_slug = re.sub(r"\s+", "-", listing["area"])
        listing_url = f"{JD_BASE}/Delhi/{slug}-{area_slug}/{listing['docid']}_BZDET/reviews"

        time.sleep(2)
        rows = _scrape_reviews(sess, listing, listing_url)
        _append_csv(rows)
        print(f"  Saved {len(rows)} reviews\n")
        time.sleep(2)

    return branches


def scrape_by_url(url: str) -> int:
    """Original URL-based scraping (kept for backwards compatibility)."""
    sess = cf.Session(impersonate="chrome")
    r = _fetch(sess, url, BROWSE_HDR)
    if not r:
        print("[!] Could not load the listing page.")
        return 0

    soup = BeautifulSoup(r.text, "html.parser")
    nd_tag = soup.find("script", id="__NEXT_DATA__")
    if not nd_tag:
        print("[!] Page structure not recognised.")
        return 0

    nd = json.loads(nd_tag.string)
    pp = nd["props"]["pageProps"]
    docid = pp.get("docid", "")
    city  = pp.get("city", "Delhi")
    data_block = pp.get("reviews", {}).get("data", {})
    total = int(data_block.get("count", 0))
    salon_name = ""
    area = ""
    if data_block.get("rating"):
        salon_name = data_block["rating"][0].get("compname", "")

    if not docid or not total:
        print("[!] Could not determine docid or total count.")
        return 0

    listing = {"name": salon_name, "area": area, "docid": docid}
    rows = _scrape_reviews(sess, listing, url)
    _append_csv(rows)
    print(f"[+] Wrote {len(rows)} reviews -> {OUTPUT_CSV.resolve()}")
    return len(rows)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Scrape JustDial Delhi reviews by salon name or URL"
    )
    parser.add_argument("input", help="Salon name (e.g. 'Lakme Salon') or full JustDial URL")
    parser.add_argument("--branches", type=int, default=1,
                        help="How many branches to scrape when searching by name (default: 1)")
    parser.add_argument("--area", default="",
                        help="Filter branches by area (e.g. 'South Extension')")
    args = parser.parse_args()

    if args.input.startswith("http"):
        scrape_by_url(args.input)
    else:
        scrape_by_name(args.input, branches=args.branches, area_filter=args.area)

    print(f"\nCSV: {OUTPUT_CSV.resolve()}")
