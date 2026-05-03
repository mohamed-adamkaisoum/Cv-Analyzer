import requests

BASE_URL = "http://127.0.0.1:8000"

def register():
    user_data = {
        "email": "test@example.com",
        "full_name": "Asmae Test",
        "password": "testpassword123"
    }

    print("--- 1. Registering User ---")
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
        if response.status_code == 201:
            print("✅ User registered successfully!")
        elif response.status_code == 400:
            print("ℹ️ User already exists. Ready for upload.")
        else:
            print(f"❌ Failed: {response.status_code}")
            print(response.json())
    except Exception as e:
        print(f"❌ Error: {e}. Check if Uvicorn is running!")

if __name__ == "__main__":
    register()