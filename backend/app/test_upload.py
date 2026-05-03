import requests
import os

BASE_URL = "http://127.0.0.1:8000"

# 1. Login Logic
login_data = {"email": "test@example.com", "password": "testpassword123"}
try:
    login_res = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if login_res.status_code != 200:
        print("❌ Login failed. Run 'register_user.py' first because you reset the DB!")
        exit()
    token = login_res.json()["access_token"]
except Exception as e:
    print(f"❌ Connection Error: {e}")
    exit()

headers = {"Authorization": f"Bearer {token}"}

# 2. Dynamic Selection (The Choice)
print("\n--- CV Stocking System ---")
filename = input("Type the name of the file inside your 'uploads' folder (e.g., my_cv.pdf): ")
# We look one level up from /app/ into /uploads/
file_path = os.path.join("uploads", filename)
if not os.path.exists(file_path):
    print(f"❌ Error: Could not find '{filename}' in {os.path.abspath(file_path)}")
    exit()

# 3. Upload & Stock
with open(file_path, "rb") as f:
    files = {"file": (filename, f, "application/pdf")}
    response = requests.post(f"{BASE_URL}/cv/upload", headers=headers, files=files)

print(f"\nStatus: {response.status_code}")
print(response.json())