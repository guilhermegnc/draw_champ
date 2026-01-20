import os
import time
import requests
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(docs_url="/docs", openapi_url="/openapi.json")

# CORS configuration
origins = [
    "http://localhost",
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:5173",
    "*" # Allow Vercel deployments
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RIOT_API_KEY = os.getenv("RIOT_API_KEY")
BASE_URL = "https://br1.api.riotgames.com"
AMERICAS_URL = "https://americas.api.riotgames.com"
# Try to find profiles.json in cli folder if it exists, otherwise current
PROFILE_FILE = os.path.join(os.path.dirname(__file__), '..', 'cli', 'profiles.json')

from fastapi import APIRouter

router = APIRouter(prefix="/api")

# Global cache for profiles
_profiles_cache = {
    "path": None,
    "mtime": 0,
    "data": None
}

@router.get("")
def read_root_api():
    return {"message": "Draw Champ API is running"}

@app.get("/")
def read_root():
    return {"message": "Draw Champ API is running"}

@router.get("/profiles")
def get_profiles():
    # Identify which file to use
    target_file = None
    if os.path.exists(PROFILE_FILE):
        target_file = PROFILE_FILE
    else:
        local_profile = "profiles.json"
        if os.path.exists(local_profile):
            target_file = local_profile

    if target_file is None:
        return {}

    try:
        current_mtime = os.path.getmtime(target_file)

        # Check if cache is valid
        if (_profiles_cache["path"] == target_file and
            _profiles_cache["mtime"] == current_mtime and
            _profiles_cache["data"] is not None):
            return _profiles_cache["data"]

        # Update cache
        with open(target_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        _profiles_cache["path"] = target_file
        _profiles_cache["mtime"] = current_mtime
        _profiles_cache["data"] = data
        return data

    except (OSError, json.JSONDecodeError):
        # Raise to preserve original behavior (500 error on file read/parse issues)
        raise

@router.get("/summoner/{name}/{tag}")
def get_summoner(name: str, tag: str):
    if not RIOT_API_KEY:
        raise HTTPException(status_code=500, detail="RIOT_API_KEY not configured")
    
    url = f"{AMERICAS_URL}/riot/account/v1/accounts/by-riot-id/{name}/{tag}"
    headers = {"X-Riot-Token": RIOT_API_KEY}
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=response.status_code, detail=str(e))

@router.get("/mastery/{puuid}")
def get_mastery(puuid: str):
    if not RIOT_API_KEY:
        raise HTTPException(status_code=500, detail="RIOT_API_KEY not configured")

    url = f"{BASE_URL}/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}"
    headers = {"X-Riot-Token": RIOT_API_KEY}
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=response.status_code, detail=str(e))

# Cache for DDragon version
ddragon_version_cache = {
    "version": None,
    "last_fetched": 0
}
CACHE_DURATION = 3600  # 1 hour

@router.get("/ddragon-version")
def get_ddragon_version():
    current_time = time.time()

    # Check if cache is valid
    if (ddragon_version_cache["version"] and
        current_time - ddragon_version_cache["last_fetched"] < CACHE_DURATION):
        return {"version": ddragon_version_cache["version"]}

    try:
        response = requests.get("https://ddragon.leagueoflegends.com/api/versions.json")
        response.raise_for_status()
        version = response.json()[0]

        # Update cache
        ddragon_version_cache["version"] = version
        ddragon_version_cache["last_fetched"] = current_time

        return {"version": version}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(router)
