# League of Legends Champion Randomizer

## Description

This is a Python script that helps League of Legends players select random champions to play. It can filter champions based on mastery level and role, and it allows users to create and manage profiles for different summoners and configurations.

## Features

-   Select one or more random champions.
-   Filter champions by maximum mastery level.
-   Filter champions by role (Top, Jungle, Mid, ADC, Support).
-   Create and save profiles with different settings.
-   Delete saved profiles.
-   User-friendly interface with menus and prompts.

## Requirements

-   Python 3
-   `requests`
-   `python-dotenv`
-   `rich`
-   `InquirerPy`

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/your-repository.git
    cd your-repository
    ```

2.  Install the required packages:
    ```bash
    pip install -r requirements.txt
    ```
    *(Note: A `requirements.txt` file may need to be created if it doesn't exist. You can create one by running `pip freeze > requirements.txt` after installing the packages listed above.)*

## Configuration

1.  You need a Riot Games API key to use this script. You can get one from the [Riot Developer Portal](https://developer.riotgames.com/).

2.  Create a file named `.env` in the root directory of the project.

3.  Add your API key to the `.env` file like this:
    ```
    RIOT_API_KEY="YOUR_API_KEY_HERE"
    ```

## Usage

Run the script from your terminal:

```bash
python main.py
```

The script will guide you through a menu where you can:

-   **Use an existing profile**: If you have saved profiles, you can select one to use for the champion draw.
-   **Create a new profile**: You can create a new profile by providing a profile name, summoner name, tag line, maximum mastery level, number of champions to select, and a specific role.
-   **Delete a profile**: You can delete a saved profile.
-   **Exit**: Close the application.