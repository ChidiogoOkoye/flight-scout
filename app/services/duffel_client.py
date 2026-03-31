import requests
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

class DuffelClient:
    def __init__(self):
        self.token = os.getenv("DUFFEL_ACCESS_TOKEN")
        self.base_url = "https://api.duffel.com/air/offer_requests"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Duffel-Version": "v2",
            "Content-Type": "application/json",
            "Accept-Encoding": "gzip",
            "Accept": "application/json"
        }

    def get_flights(self, destination):
        if not self.token:
            print("Warning: DUFFEL_ACCESS_TOKEN missing or invalid in .env")
            return []

        # Duffel requires a departure date.  it is set to 30 days from now.
        departure_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")

        payload = {
            "data": {
                "slices": [
                    {
                        "origin": "LON",
                        "destination": destination,
                        "departure_date": departure_date
                    }
                ],
                "passengers": [{"type": "adult"}],
                "cabin_class": "economy"
            }
        }

        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=payload,
                timeout=15
            )
            response.raise_for_status()
            data = response.json()
        except requests.exceptions.RequestException as e:
            print(f"Duffel API HTTP Error: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Duffel Error Details: {e.response.text}")
            return []

        if "data" not in data or "offers" not in data["data"]:
            return []

        flights = []
        offers = data["data"]["offers"]
        
        # Limit to top 10 offers
        for offer in offers[:10]:
            try:
                price = offer["total_amount"]
                
                # Owner is usually the airline
                airline_name = offer["owner"]["name"]
                
                # Slices represent the routing
                slices = offer["slices"][0]
                departure_time = slices["segments"][0]["departing_at"]
                
                # Return time is empty for one-way searches
                return_time = ""
                
                flights.append({
                    "city": destination,
                    "price": price,
                    "airline": airline_name,
                    "departure": departure_time,
                    "return": return_time,
                    "link": f"https://www.skyscanner.net/transport/flights/lon/{destination.lower()}"
                })
            except (KeyError, IndexError) as e:
                print(f"Skipped mapping flight due to missing data: {e}")
                continue

        return flights
