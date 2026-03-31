from app.services.duffel_client import DuffelClient
import time

class FlightService:
    def __init__(self):
        self.client = DuffelClient()
        self.cache = {
            "PAR": {
                "data": [],
                "timestamp": 123456
            },
            "BER": {
                "data": [],
                "timestamp": 123457
            }
        }

    def search_deals(self, destination):
        now = time.time()

        if destination in self.cache:
            cache_info = self.cache[destination]
            timestamp = cache_info.get("timestamp", 0)
            if isinstance(timestamp, (int, float)):
                if now - timestamp < 300:
                    data = cache_info.get("data")
                    if data:
                        return data

        # Call API
        result = self.client.get_flights(destination)

        # Save cache
        self.cache[destination] = {
            "data": result,
            "timestamp": now
        }

        return result

    