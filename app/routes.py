from flask import Blueprint, render_template, jsonify, request
from app.services.flight_service import FlightService
import requests


main = Blueprint("main", __name__)
service = FlightService()

@main.route("/")
def home():
    return render_template("index.html")

@main.route("/deals")
def deals():
    from datetime import datetime, timedelta
    dep_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    ret_date = (datetime.now() + timedelta(days=8)).strftime("%Y-%m-%d")
    return jsonify(service.search_deals("LON", "PAR", dep_date, ret_date))

@main.route("/search")
def search():
    origin = request.args.get("origin", "LON").strip().upper()
    destination = request.args.get("destination", "").strip().upper()
    dep_date = request.args.get("departure_date")
    ret_date = request.args.get("return_date")
    
    if not ret_date:
        ret_date = None

    if not destination or len(destination) < 3:
        return jsonify({"error": "Invalid destination city code"}), 400
        
    if not origin or len(origin) < 3:
        return jsonify({"error": "Invalid origin city code"}), 400
        
    if not dep_date:
        return jsonify({"error": "Departure date is required"}), 400

    deals = service.search_deals(origin, destination, dep_date, ret_date)

    if not deals:
        return jsonify({
            "status": "no_results",
            "city": destination,
            "suggestions": ["AMS", "BRU", "BER"]
        })

    return jsonify({
        "status": "success",
        "data": deals
    })