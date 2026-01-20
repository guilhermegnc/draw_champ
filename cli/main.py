import os
import requests
import random
import json
import sys
from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from InquirerPy import inquirer
import re

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

RIOT_API_KEY = os.getenv("RIOT_API_KEY")
BASE_URL = "https://br1.api.riotgames.com"

CHAMPION_DATA = {}
CHAMPION_ROLES_MAP = {}
PROFILE_FILE = os.path.join(os.path.dirname(__file__), 'profiles.json')

# Mapeamento regex → rota oficial da API
ROLE_MAP = {
    r"^(top|t)$": "TOP",
    r"^(mid|middle|m)$": "MIDDLE",
    r"^(jg|jungle|jungler|j)$": "JUNGLE",
    r"^(sup|support|suporte|s|utility|u)$": "UTILITY",
    r"^(adc|bot|bottom|b)$": "BOTTOM",
}

console = Console()

def clear():
    os.system("cls" if os.name == "nt" else "clear")

def load_profiles():
    if os.path.exists(PROFILE_FILE):
        with open(PROFILE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_profiles(profiles):
    with open(PROFILE_FILE, "w", encoding="utf-8") as f:
        json.dump(profiles, f, indent=4, ensure_ascii=False)

def load_champion_roles_from_community_dragon():
    global CHAMPION_ROLES_MAP
    url = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-rune-recommendations.json"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()

    for entry in data:
        champion_id = entry["championId"]
        champion_name = get_champion_name(champion_id)
        roles = set()
        for rec in entry["runeRecommendations"]:
            position = rec["position"]
            if position and position != "NONE":
                roles.add(position.capitalize())
        CHAMPION_ROLES_MAP[champion_name] = list(roles)

def get_champion_data():
    global CHAMPION_DATA
    if not CHAMPION_DATA:
        ddragon_version = requests.get("https://ddragon.leagueoflegends.com/api/versions.json").json()[0]
        url = f"http://ddragon.leagueoflegends.com/cdn/{ddragon_version}/data/en_US/champion.json"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()["data"]
        for champion_name, champion_info in data.items():
            CHAMPION_DATA[int(champion_info["key"])] = {"name": champion_name, "tags": champion_info["tags"]}
    return CHAMPION_DATA

def get_champion_name(champion_id):
    return CHAMPION_DATA.get(champion_id, {"name": f"Unknown Champion ({champion_id})"})["name"]

def get_summoner_puuid(summoner_name, tag_line):
    url = f"https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{summoner_name}/{tag_line}"
    headers = {"X-Riot-Token": RIOT_API_KEY}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()["puuid"]

def get_champion_mastery(puuid):
    url = f"{BASE_URL}/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}"
    headers = {"X-Riot-Token": RIOT_API_KEY}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()

def filter_champions_by_mastery(mastery_data, max_mastery_level):
    if max_mastery_level is None:
        return mastery_data  # sem filtro
    return [entry for entry in mastery_data if entry["championLevel"] <= max_mastery_level]

def filter_champions_by_role(champion_list, role):
    if not role:
        return champion_list
    filtered_by_role = []
    for entry in champion_list:
        champion_id = entry["championId"]
        champion_name = get_champion_name(champion_id)
        if champion_name in CHAMPION_ROLES_MAP and role.capitalize() in CHAMPION_ROLES_MAP[champion_name]:
            filtered_by_role.append(entry)
    return filtered_by_role

def select_random_champions(champion_list, quantity):
    if quantity > len(champion_list):
        console.print(f"[yellow]Aviso:[/yellow] Quantidade solicitada ({quantity}) é maior que o número de campeões disponíveis ({len(champion_list)}). Selecionando todos.")
        return random.sample(champion_list, len(champion_list))
    return random.sample(champion_list, quantity)

def normalize_role(user_input: str):
    if not user_input:
        return None
    role = user_input.strip().lower()
    for pattern, api_role in ROLE_MAP.items():
        if re.match(pattern, role):
            return api_role
    return None

def run_profile(profile):
    get_champion_data()
    load_champion_roles_from_community_dragon()

    try:
        puuid = get_summoner_puuid(profile["summoner_name"], profile["tag_line"])
    except Exception as e:
        console.print(f"[red]Erro ao buscar PUUID: {e}[/red]")
        input("Pressione ENTER para voltar ao menu...")
        return

    while True:
        clear()
        try:
            mastery_data = get_champion_mastery(puuid)

            filtered_champs = filter_champions_by_mastery(mastery_data, profile.get("max_mastery"))
            filtered_champs = filter_champions_by_role(filtered_champs, profile.get("role"))

            if not filtered_champs:
                console.print("[red]Nenhum campeão encontrado com os critérios de filtro.[/red]")
            else:
                selected = select_random_champions(filtered_champs, profile.get("quantity", 1))
                table = Table(title=f"Sorteio - {profile['summoner_name']}#{profile['tag_line']}")
                table.add_column("Campeão", style="cyan")
                table.add_column("Maestria", style="magenta")

                for champ in selected:
                    table.add_row(get_champion_name(champ['championId']), str(champ['championLevel']))

                console.print(table)

        except Exception as e:
            console.print(f"[red]Erro: {e}[/red]")

        choice = inquirer.select(
            message="O que deseja fazer?",
            choices=["Repetir sorteio", "Voltar ao menu principal"],
            default="Repetir sorteio",
        ).execute()

        if choice == "Repetir sorteio":
            continue
        else:
            break

def main():
    profiles = load_profiles()

    while True:
        clear()
        console.print(Panel("[bold cyan]🎲 League of Legends Champion Randomizer[/bold cyan]", expand=False))

        choice = inquirer.select(
            message="Selecione uma opção:",
            choices=["Usar perfil existente", "Criar novo perfil", "Excluir perfil", "Sair"],
        ).execute()

        if choice == "Usar perfil existente":
            if not profiles:
                console.print("[yellow]Nenhum perfil salvo.[/yellow]")
                input("Pressione ENTER para voltar...")
                continue
            profile_name = inquirer.select(
                message="Escolha o perfil:",
                choices=list(profiles.keys()),
            ).execute()
            run_profile(profiles[profile_name])

        elif choice == "Criar novo perfil":
            profile_name = inquirer.text(message="Nome do perfil:").execute()
            summoner_name = inquirer.text(message="Summoner name:").execute()
            tag_line = inquirer.text(message="Tag line:").execute()
            max_mastery = inquirer.text(message="Nível máximo de maestria (vazio = todos):").execute()
            quantity = inquirer.text(message="Quantidade de campeões (default=1):").execute()
            role_input = inquirer.text(message="Rota (Top, Jungle, Mid, ADC, Support ou vazio):").execute()
            role = normalize_role(role_input)

            profile = {
                "summoner_name": summoner_name,
                "tag_line": tag_line,
                "max_mastery": int(max_mastery) if max_mastery else None,
                "quantity": int(quantity) if quantity else 1,
                "role": role if role else None,
            }
            profiles[profile_name] = profile
            save_profiles(profiles)
            console.print(f"[green]Perfil '{profile_name}' salvo![/green]")
            run_profile(profile)

        elif choice == "Excluir perfil":
            if not profiles:
                console.print("[yellow]Nenhum perfil salvo.[/yellow]")
                input("Pressione ENTER para voltar...")
                continue
            profile_name = inquirer.select(
                message="Selecione o perfil para excluir:",
                choices=list(profiles.keys()),
            ).execute()
            profiles.pop(profile_name)
            save_profiles(profiles)
            console.print(f"[red]Perfil '{profile_name}' excluído.[/red]")
            input("Pressione ENTER para voltar...")

        elif choice == "Sair":
            clear()
            console.print("[bold red]Saindo...[/bold red]")
            break

if __name__ == "__main__":
    main()
