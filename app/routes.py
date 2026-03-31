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
    return jsonify(service.search_deals("PAR"))

@main.route("/search")
def search():
    city = request.args.get("city")

    if not city or len(city) < 3:
        return jsonify({"error": "Invalid city"}), 400

    deals = service.search_deals(city)

    if not deals:
        return jsonify({
            "status": "no_results",
            "city": city,
            "suggestions": ["Amsterdam", "Brussels", "Berlin"]
        })

    return jsonify({
        "status": "success",
        "data": deals
    })