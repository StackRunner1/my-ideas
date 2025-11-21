"""FastAPI application for the my-ideas backend.

Provides a minimal app with CORS and middleware that injects `x-request-id`
and `x-duration-ms` headers, and exposes a `/health` endpoint.
"""

import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response


def create_app() -> FastAPI:
    app = FastAPI(title="my-ideas-api", version="0.1.0")

    origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    class RequestIDTimingMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request: Request, call_next):
            request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
            request.state.request_id = request_id
            start = time.perf_counter()
            response = await call_next(request)
            duration_ms = int((time.perf_counter() - start) * 1000)
            # Ensure headers can be set on the response
            if not isinstance(response, Response):
                response = Response(
                    content=response.body,
                    status_code=response.status_code,
                    headers=dict(response.headers),
                )
            response.headers["x-request-id"] = request_id
            response.headers["x-duration-ms"] = str(duration_ms)
            return response

    app.add_middleware(RequestIDTimingMiddleware)

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    return app


app = create_app()
