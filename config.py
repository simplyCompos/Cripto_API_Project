import os
from dotenv import load_dotenv

load_dotenv()

FLASK_ENV = os.getenv('FLASK_ENV', 'development')
FLASK_APP = os.getenv('FLASK_APP', 'BitcoinApiProject.py')
ALPHA_VANTAGE_API_KEY = os.getenv('ALPHA_VANTAGE_API_KEY')
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///crypto_cache.db')
CACHE_TIMEOUT = int(os.getenv('CACHE_TIMEOUT', '3600'))

COINGECKO_API = "https://api.coingecko.com/api/v3"
ALPHA_VANTAGE_API = "https://www.alphavantage.co/query"

if not ALPHA_VANTAGE_API_KEY:
    raise ValueError("ALPHA_VANTAGE_API_KEY not set in .env file")
