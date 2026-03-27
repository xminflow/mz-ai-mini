from __future__ import annotations


def test_health_route_returns_standard_response(client) -> None:
    response = client.get("/api/v1/health")

    body = response.json()
    assert response.status_code == 200
    assert response.headers["X-Request-Id"] == body["request_id"]
    assert body["code"] == "COMMON.SUCCESS"
    assert body["message"] == "success"
    assert body["data"]["status"] == "ok"
    assert body["data"]["service_name"] == "mz-ai-backend"
    assert body["data"]["environment"] == "test"
    assert body["data"]["version"] == "0.1.0"
    assert body["timestamp"]


def test_health_route_echoes_request_id(client) -> None:
    response = client.get("/api/v1/health", headers={"X-Request-Id": "req-health"})

    body = response.json()
    assert response.status_code == 200
    assert response.headers["X-Request-Id"] == "req-health"
    assert body["request_id"] == "req-health"
