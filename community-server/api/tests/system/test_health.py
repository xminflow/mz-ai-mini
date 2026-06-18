from __future__ import annotations

from fastapi.testclient import TestClient


def test_health_endpoint_returns_ok_envelope(client: TestClient) -> None:
    """GET /api/v1/health 返回标准成功信封与服务元数据。"""

    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert "X-Request-Id" in response.headers

    body = response.json()
    assert body["code"] == "COMMON.SUCCESS"
    assert body["message"] == "success"
    assert body["request_id"]
    assert body["timestamp"]

    data = body["data"]
    assert data["status"] == "ok"
    assert data["service_name"] == "community-backend"
    assert data["environment"] == "test"
    assert data["version"]
