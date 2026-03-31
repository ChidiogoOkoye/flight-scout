# ✈️ FlightScout

FlightScout is a sleek, modern, and lightning-fast web application that helps users find the best flight deals across the globe. Built with an elegant Dual-Glassmorphic user interface and powered by real-time flight data via the Duffel API, FlightScout ensures an effortless and beautiful booking experience.

## ✨ Features

- **Live Flight Data**: Integrated with the **Duffel API** to seamlessly fetch multi-slice return and one-way flight itineraries directly from airlines.
- **Advanced Search Parameters**: Specify your origin, destination, and exact dates, and watch FlightScout assemble the best round trips.
- **Glassmorphic UI**: Experience a gorgeous, modern interface featuring frosted glass window components and dynamic micro-animations.
- **Light & Dark Mode**: Built-in system-aware color themes that automatically invert your glass backgrounds for effortless late-night scrolling.
- **Dynamic Price Sorting**: Sort flights smoothly by price with one click.
- **Intelligent Heatmapping**: Prices are automatically color-coded into three visual tiers (Green: Cheapest 33%, Yellow: Median, Red: Most Expensive) to help you gauge the market instantly.
- **High-Performance Caching**: Powered by a Python composite caching system that ensures fast retrieval without hitting API rate limits.

## 🛠 Tech Stack

- **Backend**: Python 3.x, Flask
- **Flight Engine**: Duffel API (`v2`), Python `requests`
- **Frontend**: Vanilla JavaScript (ES6+), HTML5
- **Styling**: Tailwind CSS (via CDN) + Custom Vanilla CSS

## ⚙️ Prerequisites

Before you begin, ensure you have the following requirements installed:
- Python 3.8+
- A valid [Duffel](https://duffel.com/) Account & API Access Token.

## 🚀 Getting Started

Follow these steps to get FlightScout up and running locally:

### 1. Clone the Repository
```bash
git clone https://github.com/ChidiogoOkoye/flight-scout.git
cd flight-scout
```

### 2. Set Up Your Virtual Environment
Create an isolated Python virtual environment to manage dependencies safely:
```bash
python -m venv .venv
```
Activate the environment:
- **Windows**: `.venv\Scripts\activate`
- **macOS/Linux**: `source .venv/bin/activate`

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Inside the root directory, create a `.env` file (or edit the existing one) and add your Duffel Access Token:
```env
PYTHONPATH=.
DUFFEL_ACCESS_TOKEN=your_duffel_token_here
```

### 5. Run the Application
Start up the Flask development server:
```bash
python run.py
```
Open your web browser and navigate to `http://127.0.0.1:5000` to start scouting flights!

## 🧩 Project Structure
- `app/`: Contains the core Flask application, routing, and modular service files (`flight_service.py`, `duffel_client.py`).
- `templates/`: Contains `index.html` featuring the Dual-Glassmorphic UI logic.
- `static/js/`: Contains `main.js`, driving caching, dynamic HTML injection, and theme rendering.
- `run.py`: The entrypoint for launching the server.

---
*Built with ❤️ for modern travelers.*
