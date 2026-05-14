"""Metrics collection"""
from prometheus_client import Counter, Histogram, Gauge
import time

# Request metrics
request_count = Counter(
    "wallcraft_requests_total",
    "Total requests",
    ["method", "endpoint", "status"],
)

request_duration = Histogram(
    "wallcraft_request_duration_seconds",
    "Request duration in seconds",
    ["method", "endpoint"],
)

# Business metrics
posters_viewed = Counter(
    "wallcraft_posters_viewed_total",
    "Total posters viewed",
)

orders_created = Counter(
    "wallcraft_orders_created_total",
    "Total orders created",
)

ai_layouts_generated = Counter(
    "wallcraft_ai_layouts_generated_total",
    "Total AI layouts generated",
)

active_sessions = Gauge(
    "wallcraft_active_sessions",
    "Active user sessions",
)
