from __future__ import annotations

from datetime import UTC, datetime
from functools import lru_cache
from threading import Lock


class SnowflakeGenerator:
    """Generate unique business identifiers using the Snowflake algorithm."""

    _custom_epoch_ms = int(datetime(2025, 1, 1, tzinfo=UTC).timestamp() * 1000)
    _worker_id_bits = 5
    _datacenter_id_bits = 5
    _sequence_bits = 12

    _max_worker_id = (1 << _worker_id_bits) - 1
    _max_datacenter_id = (1 << _datacenter_id_bits) - 1
    _sequence_mask = (1 << _sequence_bits) - 1

    _worker_id_shift = _sequence_bits
    _datacenter_id_shift = _sequence_bits + _worker_id_bits
    _timestamp_left_shift = _sequence_bits + _worker_id_bits + _datacenter_id_bits

    def __init__(self, *, worker_id: int = 0, datacenter_id: int = 0) -> None:
        if not 0 <= worker_id <= self._max_worker_id:
            raise ValueError("worker_id is out of range.")
        if not 0 <= datacenter_id <= self._max_datacenter_id:
            raise ValueError("datacenter_id is out of range.")

        self._worker_id = worker_id
        self._datacenter_id = datacenter_id
        self._sequence = 0
        self._last_timestamp = -1
        self._lock = Lock()

    def generate(self) -> int:
        """Generate a new Snowflake identifier."""

        with self._lock:
            timestamp = self._current_timestamp()
            if timestamp < self._last_timestamp:
                timestamp = self._wait_until_next_millisecond(self._last_timestamp)

            if timestamp == self._last_timestamp:
                self._sequence = (self._sequence + 1) & self._sequence_mask
                if self._sequence == 0:
                    timestamp = self._wait_until_next_millisecond(self._last_timestamp)
            else:
                self._sequence = 0

            self._last_timestamp = timestamp
            return (
                ((timestamp - self._custom_epoch_ms) << self._timestamp_left_shift)
                | (self._datacenter_id << self._datacenter_id_shift)
                | (self._worker_id << self._worker_id_shift)
                | self._sequence
            )

    @staticmethod
    def _current_timestamp() -> int:
        return int(datetime.now(UTC).timestamp() * 1000)

    def _wait_until_next_millisecond(self, last_timestamp: int) -> int:
        timestamp = self._current_timestamp()
        while timestamp <= last_timestamp:
            timestamp = self._current_timestamp()
        return timestamp


@lru_cache(maxsize=16)
def get_snowflake_generator(
    *,
    worker_id: int = 0,
    datacenter_id: int = 0,
) -> SnowflakeGenerator:
    """Return a cached Snowflake generator for the given node identifiers."""

    return SnowflakeGenerator(worker_id=worker_id, datacenter_id=datacenter_id)
