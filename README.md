# League of Legends Champion Randomizer

## Description

This project helps League of Legends players select random champions to play. It offers two interfaces:
1.  **CLI (Command Line Interface)**: A terminal-based tool.
2.  **Web Interface**: A modern web application with a FastAPI backend.

It can filter champions based on mastery level and role, and allows users to create and manage profiles.

## Features

-   Select one or more random champions.
-   Filter by maximum mastery level.
-   Filter by role (Top, Jungle, Mid, ADC, Support).
-   Manage user profiles (Summoner Name, Tag Line, Preferences).
-   **CLI**: Interactive menu with `rich` text formatting.
-   **Web**: Modern UI with real-time API integration.

## Requirements

-   **Python 3.8+**
-   **Node.js & pnpm** (for Web Interface)
-   Riot Games API Key

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repository.git
    cd your-repository
    ```

2.  **Install Python dependencies:**
    ```bash
    pip install -r api/requirements.txt
    ```
    *(Note: `api/requirements.txt` contains dependencies for both the CLI and the API)*

3.  **Install Web dependencies (Optional, for Web Interface):**
    ```bash
    cd web
    pnpm install
    cd ..
    ```

## Configuration

1.  Obtain a Riot Games API key from the [Riot Developer Portal](https://developer.riotgames.com/).
2.  Create a `.env` file in the root directory:
    ```
    RIOT_API_KEY="YOUR_API_KEY_HERE"
    ```

## Usage

### Option 1: Launcher (Windows Only)

Run the launcher script to easily choose between CLI and Web modes:

```bash
python launcher.py
```

*Note: The launcher assumes you have `pnpm` installed and available in your PATH.*

### Option 2: CLI (Manual / Cross-Platform)

To run the CLI version directly:

```bash
python cli/main.py
```

### Option 3: Web Interface (Manual / Cross-Platform)

To run the web interface, you need to start both the Backend API and the Frontend.

1.  **Start the Backend API:**
    From the root directory:
    ```bash
    uvicorn api.index:app --reload --port 8000
    ```

2.  **Start the Frontend:**
    Open a new terminal, navigate to the `web` folder, and start the development server:
    ```bash
    cd web
    pnpm dev
    ```

3.  Open your browser at `http://localhost:5173`.

## Notes

-   **Profiles**: Profiles are stored in `cli/profiles.json`. Both the CLI and API read from this file.
-   **Troubleshooting**: The `dev:api` script in `web/package.json` contains a hardcoded path and may not work on all systems. It is recommended to use the manual steps above to run the Web Interface.
