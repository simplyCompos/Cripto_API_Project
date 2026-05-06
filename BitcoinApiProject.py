from flask import Flask, jsonify, request, render_template
import requests
import os

app = Flask(__name__)

COINGECKO_API = "https://api.coingecko.com/api/v3"
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

ALPHA_VANTAGE_API = "https://www.alphavantage.co/query"

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
        url = f"{COINGECKO_API}/coins/{coin}/market_chart"

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

@app.route("/stocks")
def get_stocks():

    print (ALPHA_VANTAGE_API_KEY)
    symbol = request.args.get("symbol", "AAPL")
    
    params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": symbol,
        "apikey": ALPHA_VANTAGE_API_KEY
    }
    
    try:
        response = requests.get(ALPHA_VANTAGE_API, params=params)
        data = response.json()
        
        if "Error Message" in data:
            return jsonify(status="error", message=data["Error Message"]), 400
        
        if "Time Series (Daily)" not in data:
            return jsonify(status="error", message="No data found"), 404
        
        time_series = data["Time Series (Daily)"]
        
        prices = [
            {
                "date": date,
                "open": float(values["1. open"]),
                "high": float(values["2. high"]),
                "low": float(values["3. low"]),
                "close": float(values["4. close"]),
                "volume": int(values["5. volume"])
            }
            for date, values in list(time_series.items())[:30]  
        ]
        
        return jsonify(status="ok", symbol=symbol, data=prices)
    
    except Exception as e:
        return jsonify(status="error", message=str(e)), 500

@app.route("/combined")
def combined_prices():
    crypto = request.args.get("crypto", "bitcoin")
    stock = request.args.get("stock", "AAPL")
    currency = request.args.get("currency", "usd")
    
    result = {}
    
    crypto_url = f"{COINGECKO_API}/coins/{crypto}/market_chart"
    crypto_params = {"vs_currency": currency, "days": "30"}
    
    try:
        crypto_response = requests.get(crypto_url, params=crypto_params)
        if crypto_response.status_code == 200:
            crypto_data = crypto_response.json()
            result["crypto"] = {
                "name": crypto,
                "prices": [{"time": p[0], "price": p[1]} for p in crypto_data["prices"]]
            }
    except Exception as e:
        result["crypto"] = {"error": str(e)}
    
    stock_params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": stock,
        "apikey": ALPHA_VANTAGE_API_KEY
    }
    
    try:
        stock_response = requests.get(ALPHA_VANTAGE_API, params=stock_params)
        stock_data = stock_response.json()
        
        if "Time Series (Daily)" in stock_data:
            time_series = stock_data["Time Series (Daily)"]
            result["stocks"] = {
                "symbol": stock,
                "prices": [
                    {
                        "date": date,
                        "close": float(values["4. close"])
                    }
                    for date, values in list(time_series.items())[:30]
                ]
            }
    except Exception as e:
        result["stocks"] = {"error": str(e)}
    
    return jsonify(status="ok", data=result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
