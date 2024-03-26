import requests
from bs4 import BeautifulSoup

files = {
        'Square.cpp': (
            'Sample2.cpp',
            '''#include <stdio.h>
#include <stdlib.h>
#include <time.h>

// Function to generate a random number within a given range
int random_number(int min, int max) {
    return min + rand() % (max - min + 1);
}

// Structure to represent a character
typedef struct {
    char name[50];
    int health;
    int attack;
    int defense;
} Character;

// Function to initialize a character
Character initialize_character(char* name) {
    Character character;
    strcpy(character.name, name);
    character.health = 100;
    character.attack = random_number(10, 20);
    character.defense = random_number(5, 15);
    return character;
}

// Function to simulate a battle between two characters
void battle(Character* player, Character* enemy) {
    printf("Battle begins between %s and %s!\\n", player->name, enemy->name);
    while (player->health > 0 && enemy->health > 0) {
        // Player's turn
        int player_damage = random_number(0, player->attack) - enemy->defense;
        if (player_damage < 0) player_damage = 0;
        enemy->health -= player_damage;
        printf("%s attacks %s for %d damage!\\n", player->name, enemy->name, player_damage);
        if (enemy->health <= 0) {
            printf("%s defeated %s!\\n", player->name, enemy->name);
            break;
        }

        // Enemy's turn
        int enemy_damage = random_number(0, enemy->attack) - player->defense;
        if (enemy_damage < 0) enemy_damage = 0;
        player->health -= enemy_damage;
        printf("%s attacks %s for %d damage!\\n", enemy->name, player->name, enemy_damage);
        if (player->health <= 0) {
            printf("%s defeated %s!\\n", enemy->name, player->name);
            break;
        }
    }
}

int main() {
    srand(time(NULL)); // Seed the random number generator

    // Initialize player and enemy characters
    Character player = initialize_character("Player");
    Character enemy = initialize_character("Enemy");

    // Battle
    battle(&player, &enemy);

    // Display results
    printf("\\nBattle ended!\\n");
    printf("%s's Health: %d\\n", player.name, player.health);
    printf("%s's Health: %d\\n", enemy.name, enemy.health);

    return 0;
}
''')
    }

def fetch_submission_content():
    url = 'http://localhost:8888'
    username = 'VioletVulture'
    password = '12345678'
    session = requests.Session()
    login_page_response = session.get(url)
    soup = BeautifulSoup(login_page_response.text, 'html.parser')
    xsrf_token = soup.find('input', {'name': '_xsrf'})['value']

    login_data = {
        '_xsrf': xsrf_token,
        'next': f'/tasks/Square/submissions',
        'username': username,
        'password': password
    }

    login_response = session.get(url, data=login_data)

    if login_response.status_code == 200:
        data = {
        '_xsrf': xsrf_token
        }

        url_submit = 'http://localhost:8888/tasks/Square/submit'

        response = session.post(url_submit, data=data, files=files)
        print(response.text)  

fetch_submission_content()
