"""Distributed tracing setup"""
from app.core.config import get_settings

settings = get_settings()


def setup_tracing():
    """Setup OpenTelemetry tracing"""
    if not settings.OTEL_ENABLED:
        return None

    try:
        from opentelemetry import trace
        from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor

        otlp_exporter = OTLPSpanExporter(
            endpoint=settings.OTEL_EXPORTER_OTLP_ENDPOINT
        )
        trace.set_tracer_provider(TracerProvider())
        trace.get_tracer_provider().add_span_processor(
            BatchSpanProcessor(otlp_exporter)
        )

        return trace.get_tracer(__name__)
    except Exception as e:
        print(f"Failed to setup tracing: {e}")
        return None
