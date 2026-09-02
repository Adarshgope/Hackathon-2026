"""
Mongo access layer with a transparent in-memory fallback.

If MONGO_URI in config.py is empty (or the server is unreachable) every
collection call is served by a dict-backed shim with the same tiny surface the
app uses -- find_one / insert_one / update_one / find / count_documents. Drop
your Atlas URI into config.MONGO_URI and the real driver takes over with no
other code change.
"""

import threading
from datetime import datetime, timezone

from . import config

_client = None
_db = None
_status = {"connected": False, "backend": "memory", "detail": "MONGO_URI not configured"}


class _MemoryCollection:
    """Minimal in-memory stand-in for a pymongo Collection."""

    def __init__(self, name):
        self.name = name
        self._docs = []
        self._lock = threading.Lock()

    @staticmethod
    def _matches(doc, query):
        return all(doc.get(k) == v for k, v in (query or {}).items())

    def find_one(self, query=None, *_args, **_kwargs):
        with self._lock:
            return next((dict(d) for d in self._docs if self._matches(d, query)), None)

    def find(self, query=None, *_args, **_kwargs):
        with self._lock:
            return [dict(d) for d in self._docs if self._matches(d, query)]

    def insert_one(self, doc):
        with self._lock:
            stored = dict(doc)
            stored.setdefault("_id", f"mem-{self.name}-{len(self._docs) + 1}")
            self._docs.append(stored)
        return type("InsertOneResult", (), {"inserted_id": stored["_id"]})()

    def update_one(self, query, update, upsert=False):
        with self._lock:
            for doc in self._docs:
                if self._matches(doc, query):
                    doc.update(update.get("$set", {}))
                    return type("UpdateResult", (), {"modified_count": 1})()
        if upsert:
            merged = dict(query)
            merged.update(update.get("$set", {}))
            self.insert_one(merged)
        return type("UpdateResult", (), {"modified_count": 0})()

    def count_documents(self, query=None):
        with self._lock:
            return sum(1 for d in self._docs if self._matches(d, query))

    def create_index(self, *_args, **_kwargs):
        return None


class _MemoryDB:
    def __init__(self):
        self._collections = {}

    def __getitem__(self, name):
        return self._collections.setdefault(name, _MemoryCollection(name))

    def get_collection(self, name):
        return self[name]


def init_db():
    """Connect to Atlas if a URI is present; otherwise stay in memory."""
    global _client, _db, _status

    if not config.MONGO_URI:
        _db = _MemoryDB()
        _status = {"connected": False, "backend": "memory",
                   "detail": "MONGO_URI is empty — running on the in-memory store"}
        return _db

    try:
        from pymongo import MongoClient
        from pymongo.errors import PyMongoError

        _client = MongoClient(config.MONGO_URI, serverSelectionTimeoutMS=4000)
        _client.admin.command("ping")
        _db = _client[config.MONGO_DB_NAME]
        _db["users"].create_index("email", unique=True)
        _status = {"connected": True, "backend": "mongodb",
                   "detail": f"Connected to database '{config.MONGO_DB_NAME}'"}
    except Exception as exc:  # driver missing, bad URI, network, auth
        _db = _MemoryDB()
        _status = {"connected": False, "backend": "memory",
                   "detail": f"Mongo unavailable ({type(exc).__name__}) — using in-memory store"}

    return _db


def get_db():
    return _db if _db is not None else init_db()


def db_status():
    if _db is None:
        init_db()
    return dict(_status)


def collection(name):
    return get_db()[name]


def utcnow():
    return datetime.now(timezone.utc)
