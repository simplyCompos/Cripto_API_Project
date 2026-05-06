from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import json

db = SQLAlchemy()

class CryptoCache(db.Model):
    __tablename__ = 'crypto_cache'
    id = db.Column(db.Integer, primary_key=True)
    coin = db.Column(db.String(50), nullable=False, unique=True)
    currency = db.Column(db.String(10), default='usd')
    data = db.Column(db.JSON, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def is_expired(self, timeout=3600):
        return (datetime.utcnow() - self.timestamp).seconds > timeout
    
    def __repr__(self):
        return f'<CryptoCache {self.coin}>'

class StockCache(db.Model):
    __tablename__ = 'stock_cache'
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), nullable=False, unique=True)
    data = db.Column(db.JSON, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def is_expired(self, timeout=3600):
        return (datetime.utcnow() - self.timestamp).seconds > timeout
    
    def __repr__(self):
        return f'<StockCache {self.symbol}>'

class APILog(db.Model):
    __tablename__ = 'api_logs'
    id = db.Column(db.Integer, primary_key=True)
    endpoint = db.Column(db.String(100), nullable=False)
    request_params = db.Column(db.JSON)
    status_code = db.Column(db.Integer)
    response_time = db.Column(db.Float)  # in seconds
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    cache_hit = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f'<APILog {self.endpoint} {self.status_code}>'

def init_db(app):
    """Initialize database"""
    with app.app_context():
        db.create_all()
        print('✓ Database tables created')

def get_crypto_cache(coin, currency='usd', timeout=3600):
    """Get cached crypto data"""
    cache = CryptoCache.query.filter_by(coin=coin, currency=currency).first()
    if cache and not cache.is_expired(timeout):
        return cache.data, True
    return None, False

def set_crypto_cache(coin, currency, data):
    """Cache crypto data"""
    cache = CryptoCache.query.filter_by(coin=coin, currency=currency).first()
    if cache:
        cache.data = data
        cache.timestamp = datetime.utcnow()
    else:
        cache = CryptoCache(coin=coin, currency=currency, data=data)
    db.session.add(cache)
    db.session.commit()

def get_stock_cache(symbol, timeout=3600):
    """Get cached stock data"""
    cache = StockCache.query.filter_by(symbol=symbol).first()
    if cache and not cache.is_expired(timeout):
        return cache.data, True
    return None, False

def set_stock_cache(symbol, data):
    """Cache stock data"""
    cache = StockCache.query.filter_by(symbol=symbol).first()
    if cache:
        cache.data = data
        cache.timestamp = datetime.utcnow()
    else:
        cache = StockCache(symbol=symbol, data=data)
    db.session.add(cache)
    db.session.commit()

def log_api_request(endpoint, params, status_code, response_time, cache_hit=False):
    """Log API request"""
    log = APILog(
        endpoint=endpoint,
        request_params=params,
        status_code=status_code,
        response_time=response_time,
        cache_hit=cache_hit
    )
    db.session.add(log)
    db.session.commit()
