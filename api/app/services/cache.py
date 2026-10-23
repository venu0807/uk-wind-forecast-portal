import time
from functools import wraps
from typing import Any

_store: dict[str, tuple[float, Any]] = {}


def ttl_cache(ttl_seconds: int = 300):
    """
    Simple async TTL cache keyed by function name + stringified args.
    Thread-safe for single-process uvicorn; not suitable for multi-worker.
    """
    def decorator(fn):
        @wraps(fn)
        async def wrapper(*args, **kwargs):
            key = f"{fn.__name__}:{args}:{kwargs}"
            now = time.monotonic()
            if key in _store:
                cached_at, value = _store[key]
                if now - cached_at < ttl_seconds:
                    return value
            result = await fn(*args, **kwargs)
            _store[key] = (now, result)
            return result
        return wrapper
    return decorator
