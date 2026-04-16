"""Re-export WechatPayV3Gateway from shared for backwards compatibility."""

from mz_ai_backend.shared.wechat_pay import WechatPayV3Gateway

__all__ = ["WechatPayV3Gateway"]
