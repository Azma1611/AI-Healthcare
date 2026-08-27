import json
import logging
import redis
from api.config import settings

logger = logging.getLogger(__name__)

class CacheManager:
    def __init__(self, max_size=1000):
        self.redis_client = None
        self.fallback_cache = {}
        self.max_size = max_size
        self.is_connected = False
        
        try:
            self.redis_client = redis.Redis.from_url(settings.redis_url, decode_responses=True)
            self.redis_client.ping()
            self.is_connected = True
            logger.info("Successfully connected to Redis.")
        except redis.ConnectionError as e:
            logger.warning(f"Failed to connect to Redis: {e}. Falling back to in-memory dictionary cache.")
            self.redis_client = None

    def get(self, key: str):
        if self.is_connected and self.redis_client:
            try:
                data = self.redis_client.get(key)
                if data:
                    return json.loads(data)
                return None
            except redis.ConnectionError:
                logger.error("Redis connection lost during get.")
                self.is_connected = False
        
        # Fallback
        return self.fallback_cache.get(key)

    def set(self, key: str, value: dict):
        if self.is_connected and self.redis_client:
            try:
                self.redis_client.set(key, json.dumps(value))
                return
            except redis.ConnectionError:
                logger.error("Redis connection lost during set.")
                self.is_connected = False
                
        # Fallback
        if len(self.fallback_cache) >= self.max_size:
            self.fallback_cache.clear()
        self.fallback_cache[key] = value

    def clear(self):
        if self.is_connected and self.redis_client:
            try:
                self.redis_client.flushdb()
                return
            except redis.ConnectionError:
                self.is_connected = False
        self.fallback_cache.clear()

# Initialize global cache
cache = CacheManager()
