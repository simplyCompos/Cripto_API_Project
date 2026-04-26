from flask import Flask, jsonify, request, render_template
import requests

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/prices")
def prices():
    coins = request.args.get("coins", "bitcoin")
    days = request.args.get("days", "30")
    currency = request.args.get("currency", "usd")

    result = {}

    for coin in coins.split(","):
        url = f"https://api.coingecko.com/api/v3/coins/{coin}/market_chart"

        params = {
            "vs_currency": currency,
            "days": days
        }

        response = requests.get(url, params=params)

        if response.status_code != 200:
            result[coin] = "error"
            continue

        data = response.json()

        prices = [
            {"time": p[0], "price": p[1]}
            for p in data["prices"]
        ]

        result[coin] = prices

    return jsonify(status="ok", data=result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
