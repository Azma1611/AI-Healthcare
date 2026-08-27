import time
from collections import defaultdict
from fastapi import Request, HTTPException
from api.config import settings
from api.cache import cache
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    """
    A rate limiter that uses Redis if available, gracefully falling back 
    to in-memory tracking suitable for development or when Redis is down.
    """
    def __init__(self):
        self.fallback_requests = defaultdict(list)
        self.limit = settings.rate_limit_requests
        self.window = settings.rate_limit_window_seconds

    def __call__(self, request: Request):
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        if cache.is_connected and cache.redis_client:
            redis_key = f"rate_limit:{client_ip}"
            try:
                # Use a Redis pipeline for atomicity
                pipeline = cache.redis_client.pipeline()
                pipeline.zremrangebyscore(redis_key, 0, current_time - self.window)
                pipeline.zcard(redis_key)
                pipeline.zadd(redis_key, {str(current_time): current_time})
                pipeline.expire(redis_key, self.window)
                results = pipeline.execute()
                
                # results[1] is the result of zcard
                request_count = results[1]
                
                if request_count >= self.limit:
                    raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
                return
            except HTTPException:
                raise
            except Exception as e:
                # Do not raise 500, log and fall back to in-memory
                logger.warning(f"Redis rate limiting failed: {e}. Falling back to in-memory.")
                cache.is_connected = False
        
        # In-memory fallback
        self.fallback_requests[client_ip] = [
            req_time for req_time in self.fallback_requests[client_ip] 
            if current_time - req_time < self.window
        ]
        
        if len(self.fallback_requests[client_ip]) >= self.limit:
            raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
            
        self.fallback_requests[client_ip].append(current_time)

# Global instance for dependency injection
rate_limiter = RateLimiter()
