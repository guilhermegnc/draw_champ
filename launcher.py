import os
import sys
import subprocess
from InquirerPy import inquirer
from rich.console import Console
from rich.panel import Panel

console = Console()

def main():
    while True:
        os.system("cls" if os.name == "nt" else "clear")
        console.print(Panel("[bold cyan]Draw Champ Launcher[/bold cyan]", expand=False))
        
        choices = [
            {"name": "CLI Version (Terminal)", "value": "cli"},
            {"name": "Web Version (Browser + API)", "value": "web"},
            {"name": "Exit", "value": "exit"}
        ]

        try:
            action = inquirer.select(
                message="Select Mode:",
                choices=choices,
                default=choices[0],
            ).execute()
        except KeyboardInterrupt:
            sys.exit()

        if action == "cli":
            # Run the CLI script. 
            os.system("python cli/main.py")
            # Loop continues when main.py exits
            
        elif action == "web":
            console.print("[green]Starting Web Version...[/green]")
            # Open Browser
            os.system('start "" "http://localhost:5173"')
            
            # Start Server in new window
            # We execute 'cd web' inside the new cmd window
            os.system('start "Draw Champ Server" cmd /k "cd web && pnpm run dev:api"')
            
            sys.exit()
            
        elif action == "exit":
            sys.exit()

if __name__ == "__main__":
    main()
