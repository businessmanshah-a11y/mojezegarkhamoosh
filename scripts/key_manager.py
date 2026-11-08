#!/usr/bin/env python3
"""
Intelligent Gemini API Key Pool & Rotation Manager
- Manages multiple Gemini API keys from .env
- Automatically tracks quota exhaustion per key (RPD - Requests Per Day)
- Rotates to the next available key seamlessly without losing progress or wasting requests
- Persists key status to .keys_status.json (gitignored)
- Accurately computes reset time at Midnight Pacific Time (08:00 UTC / 11:30 AM Iran)
"""

import os
import sys
import json
import time
from datetime import datetime, timezone, timedelta

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
ENV_FILE = os.path.join(ROOT_DIR, ".env")
STATUS_FILE = os.path.join(ROOT_DIR, ".keys_status.json")


class QuotaExhaustedException(Exception):
    """Raised when a specific API key hits daily quota limit."""
    def __init__(self, key, message, retry_after_sec=None):
        super().__init__(message)
        self.key = key
        self.retry_after_sec = retry_after_sec


def get_seconds_until_midnight_pt():
    """
    Computes seconds remaining until the next Midnight Pacific Time (PT).
    Google AI Studio daily quotas reset at 00:00 Pacific Time = 08:00 UTC = 11:30 AM Iran.
    """
    now_utc = datetime.now(timezone.utc)
    # Today's 08:00 UTC
    target_utc = now_utc.replace(hour=8, minute=0, second=0, microsecond=0)
    if now_utc >= target_utc:
        # If already passed 08:00 UTC today, target is tomorrow's 08:00 UTC
        target_utc += timedelta(days=1)
    
    diff = (target_utc - now_utc).total_seconds()
    return max(int(diff), 3600)


class GeminiKeyManager:
    def __init__(self):
        self.keys = self._load_keys()
        self.status = self._load_status()
        self._sync_status()

    def _load_keys(self):
        """Loads keys from .env or environment variables."""
        keys = []
        if os.path.exists(ENV_FILE):
            with open(ENV_FILE, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    if k == "GEMINI_API_KEYS":
                        parts = [p.strip() for p in v.split(",") if p.strip()]
                        keys.extend(parts)
                    elif k == "GEMINI_API_KEY" and v:
                        keys.append(v)
        
        # Deduplicate while preserving order
        seen = set()
        deduped = []
        for key in keys:
            if key and key not in seen:
                seen.add(key)
                deduped.append(key)
        return deduped

    def _load_status(self):
        if os.path.exists(STATUS_FILE):
            try:
                with open(STATUS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}

    def _save_status(self):
        try:
            with open(STATUS_FILE, "w", encoding="utf-8") as f:
                json.dump(self.status, f, indent=2)
        except Exception as e:
            print(f"[KeyManager] Warning: could not save status file: {e}")

    def _sync_status(self):
        """Clean expired exhaustion blocks and ensure all keys are tracked."""
        now = time.time()
        for k in self.keys:
            kid = self.mask_key(k)
            if k not in self.status:
                self.status[k] = {
                    "key_id": kid,
                    "exhausted_until": 0,
                    "success_count": 0,
                    "last_used": None,
                    "last_error": None
                }
            else:
                # If exhausted time has passed, reset
                if self.status[k].get("exhausted_until", 0) <= now:
                    self.status[k]["exhausted_until"] = 0

    @staticmethod
    def mask_key(key):
        """Display only the first 6 and last 4 characters for security."""
        if len(key) <= 12:
            return key
        return f"{key[:6]}...{key[-4:]}"

    def get_active_keys(self):
        """Returns list of keys that currently have available quota."""
        self._sync_status()
        now = time.time()
        active = []
        for k in self.keys:
            if self.status.get(k, {}).get("exhausted_until", 0) <= now:
                active.append(k)
        return active

    def mark_exhausted(self, key, retry_after_sec=None):
        """Marks a key as exhausted until next reset."""
        sec = retry_after_sec or get_seconds_until_midnight_pt()
        exhausted_until = time.time() + sec
        kid = self.mask_key(key)
        
        if key not in self.status:
            self.status[key] = {"key_id": kid, "success_count": 0}
        
        self.status[key]["exhausted_until"] = exhausted_until
        self.status[key]["last_error"] = f"Quota exhausted, retry in ~{sec // 3600}h {(sec % 3600) // 60}m"
        self._save_status()
        
        hours = sec // 3600
        mins = (sec % 3600) // 60
        print(f"\n🔑 [KeyManager] Key {kid} hit daily quota ceiling. Reserved until reset in ~{hours}h {mins}m.")

    def mark_success(self, key):
        """Increments success count for a key."""
        kid = self.mask_key(key)
        if key not in self.status:
            self.status[key] = {"key_id": kid, "exhausted_until": 0, "success_count": 0}
        self.status[key]["success_count"] = self.status[key].get("success_count", 0) + 1
        self.status[key]["last_used"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")
        self._save_status()

    def print_pool_status(self):
        """Prints a human-readable summary of the key pool."""
        self._sync_status()
        now = time.time()
        active_count = len(self.get_active_keys())
        total_count = len(self.keys)
        
        print("\n" + "=" * 65)
        print("🔑 GEMINI API KEY POOL STATUS")
        print("=" * 65)
        print(f"Total Keys Registered : {total_count}")
        print(f"Active Keys Available : {active_count} / {total_count}")
        print("-" * 65)
        
        for idx, k in enumerate(self.keys, 1):
            kid = self.mask_key(k)
            st = self.status.get(k, {})
            ex_until = st.get("exhausted_until", 0)
            succ = st.get("success_count", 0)
            
            if ex_until > now:
                rem_sec = int(ex_until - now)
                h = rem_sec // 3600
                m = (rem_sec % 3600) // 60
                badge = f"⏸ EXHAUSTED (resets in {h}h {m:02d}m)"
            else:
                badge = "🟢 ACTIVE (Ready for requests)"
            
            print(f"[{idx}] {kid:<16} : {badge} | Today's Success: {succ}")
        print("=" * 65 + "\n")


# Global singleton instance
key_manager = GeminiKeyManager()


if __name__ == "__main__":
    km = GeminiKeyManager()
    km.print_pool_status()
