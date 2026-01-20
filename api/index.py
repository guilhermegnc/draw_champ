import os
import httpx
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.client = httpx.AsyncClient()
    yield
    await app.state.client.aclose()

app = FastAPI(docs_url="/docs", openapi_url="/openapi.json", lifespan=lifespan)

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

router = APIRouter(prefix="/api")

@router.get("")
def read_root_api():
    return {"message": "Draw Champ API is running"}

@app.get("/")
def read_root():
    return {"message": "Draw Champ API is running"}

@router.get("/profiles")
def get_profiles():
    if os.path.exists(PROFILE_FILE):
        with open(PROFILE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    # Check current directory as fallback
    local_profile = "profiles.json"
    if os.path.exists(local_profile):
        with open(local_profile, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

@router.get("/summoner/{name}/{tag}")
async def get_summoner(name: str, tag: str, request: Request):
    if not RIOT_API_KEY:
        raise HTTPException(status_code=500, detail="RIOT_API_KEY not configured")
    
    url = f"{AMERICAS_URL}/riot/account/v1/accounts/by-riot-id/{name}/{tag}"
    headers = {"X-Riot-Token": RIOT_API_KEY}
    
    try:
        response = await request.app.state.client.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mastery/{puuid}")
async def get_mastery(puuid: str, request: Request):
    if not RIOT_API_KEY:
        raise HTTPException(status_code=500, detail="RIOT_API_KEY not configured")

    url = f"{BASE_URL}/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}"
    headers = {"X-Riot-Token": RIOT_API_KEY}
    
    try:
        response = await request.app.state.client.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ddragon-version")
async def get_ddragon_version(request: Request):
    try:
        response = await request.app.state.client.get("https://ddragon.leagueoflegends.com/api/versions.json")
        response.raise_for_status()
        return {"version": response.json()[0]}
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(router)
