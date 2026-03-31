from app.services.duffel_client import DuffelClient
import time

class FlightService:
    def __init__(self):
        self.client = DuffelClient()
        self.cache = {}

    def search_deals(self, origin, destination, departure_date, return_date=None):
        now = time.time()
        
        cache_key = f"{origin}-{destination}-{departure_date}-{return_date}"

        if cache_key in self.cache:
            cache_info = self.cache[cache_key]
            timestamp = cache_info.get("timestamp", 0)
            if isinstance(timestamp, (int, float)):
                if now - timestamp < 300:
                    data = cache_info.get("data")
                    if data:
                        return data

        # Call API
        result = self.client.get_flights(origin, destination, departure_date, return_date)

        # Save cache
        self.cache[cache_key] = {
            "data": result,
            "timestamp": now
        }

        return result

    