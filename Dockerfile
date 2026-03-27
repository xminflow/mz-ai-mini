FROM python:3.13-slim

# Required runtime environment variables:
# - MZ_AI_BACKEND_DATABASE_URL
#
# Optional runtime environment variables:
# - MZ_AI_BACKEND_ENV
# - MZ_AI_BACKEND_LOG_LEVEL
# - MZ_AI_BACKEND_SNOWFLAKE_WORKER_ID
# - MZ_AI_BACKEND_SNOWFLAKE_DATACENTER_ID
#
# Request identity is injected by WeChat cloud hosting through headers:
# - X-WX-OPENID
# - X-WX-UNIONID
# - X-WX-APPID
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/app/.venv \
    MZ_AI_BACKEND_ENV=production

COPY --from=ghcr.io/astral-sh/uv:0.9.14 /uv /uvx /bin/

WORKDIR /app

COPY server/pyproject.toml server/uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY server/main.py ./
COPY server/api ./api

EXPOSE 8000

CMD ["/app/.venv/bin/python", "main.py"]
