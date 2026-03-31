import requests
import os
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

    def get_flights(self, origin, destination, departure_date, return_date=None):
        if not self.token:
            print("Warning: DUFFEL_ACCESS_TOKEN missing or invalid in .env")
            return []

        slices = [
            {
                "origin": origin,
                "destination": destination,
                "departure_date": departure_date
            }
        ]
        
        if return_date:
            slices.append({
                "origin": destination,
                "destination": origin,
                "departure_date": return_date
            })

        payload = {
            "data": {
                "slices": slices,
                "passengers": [{"type": "adult"}],
                "cabin_class": "economy"
            }
        }

        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=payload,
                timeout=20
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
        
        offers = sorted(offers, key=lambda o: float(o["total_amount"]))
        
        for offer in offers[:20]:
            try:
                price = offer["total_amount"]
                airline_name = offer["owner"]["name"]
                
                slices_data = offer["slices"]
                departure_time = slices_data[0]["segments"][0]["departing_at"]
                
                return_time = ""
                if len(slices_data) > 1:
                    return_time = slices_data[1]["segments"][0]["departing_at"]
                
                flights.append({
                    "city": destination,  
                    "origin": origin,
                    "destination": destination,
                    "price": float(price),
                    "airline": airline_name,
                    "departure": departure_time,
                    "return": return_time,
                    "link": f"https://www.skyscanner.net/transport/flights/{origin.lower()}/{destination.lower()}/{departure_date}/{return_date if return_date else ''}"
                })
            except (KeyError, IndexError) as e:
                print(f"Skipped mapping flight due to missing data: {e}")
                continue

        return flights
