import requests
import json

# Your local server address
BASE_URL = 'http://127.0.0.1:8000'

def test_registration():
    user_data = {
        'email': 'test1@example.com',
        'password': 'testpassword123',
        'full_name': 'Asmae keee'
    }
    
    print('=== Testing User Registration ===')
    response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    test_registration()