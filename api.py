import os
import requests
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost",
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:5173",
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
PROFILE_FILE = "profiles.json"

@app.get("/")
def read_root():
    return {"message": "Draw Champ API is running"}

@app.get("/profiles")
def get_profiles():
    if os.path.exists(PROFILE_FILE):
        with open(PROFILE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

@app.get("/summoner/{name}/{tag}")
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

@app.get("/mastery/{puuid}")
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

@app.get("/ddragon-version")
def get_ddragon_version():
    try:
        response = requests.get("https://ddragon.leagueoflegends.com/api/versions.json")
        response.raise_for_status()
        return {"version": response.json()[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
