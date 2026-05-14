import { useEffect, useState } from "react";
import { Bot, Loader2, Mail } from "lucide-react";

import { useAgentAuthState, useRequestEmailLoginCode, useVerifyEmailLoginCode } from "./hooks";
import { Button } from "@/shared/ui/button";

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const LAST_USED_EMAIL_STORAGE_KEY = "agent-auth:last-used-email";

function readLastUsedEmail(): string {
  try {
    const value = window.localStorage.getItem(LAST_USED_EMAIL_STORAGE_KEY);
    return value?.trim() ?? "";
  } catch {
    return "";
  }
}

function saveLastUsedEmail(email: string): void {
  try {
    window.localStorage.setItem(LAST_USED_EMAIL_STORAGE_KEY, email);
  } catch {
    // Ignore storage failures and keep login usable.
  }
}

export function AgentAuthGate({ children }: { children: JSX.Element }): JSX.Element {
  const state = useAgentAuthState();
  const requestEmailLoginCode = useRequestEmailLoginCode();
  const verifyEmailLoginCode = useVerifyEmailLoginCode();
  const [email, setEmail] = useState(readLastUsedEmail);
  const [verificationCode, setVerificationCode] = useState("");
  const [loginChallengeId, setLoginChallengeId] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }
    const timer = window.setTimeout(() => {
      setCooldownSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [cooldownSeconds]);

  const queryError = state.isError ? state.error.message : null;

  const handleRequestCode = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setLoginError("请输入有效邮箱地址。");
      return;
    }
    setLoginError(null);
    const challenge = await requestEmailLoginCode.mutateAsync(normalizedEmail);
    setEmail(normalizedEmail);
    saveLastUsedEmail(normalizedEmail);
    setLoginChallengeId(challenge.login_challenge_id);
    setCooldownSeconds(challenge.cooldown_seconds);
  };

  const handleVerifyCode = async () => {
    if (loginChallengeId === "") {
      setLoginError("请先发送验证码。");
      return;
    }
    if (!/^\d{6}$/.test(verificationCode.trim())) {
      setLoginError("请输入 6 位验证码。");
      return;
    }
    setLoginError(null);
    await verifyEmailLoginCode.mutateAsync({
      loginChallengeId,
      verificationCode: verificationCode.trim(),
    });
  };

  if (state.isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-muted-foreground">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          正在确认登录状态...
        </div>
      </div>
    );
  }

  if (state.data?.authenticated) {
    return children;
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-[28px] border border-border/70 bg-card/92 p-8 shadow-[0_24px_90px_-48px_rgba(15,23,42,0.65)]">
        <section className="mb-8 space-y-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-muted/35 text-foreground">
            <Bot className="h-6 w-6" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold tracking-normal text-foreground">
              AI 运营工作台
            </h1>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-background/80 p-6">
          <div className="flex flex-col gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">邮箱</span>
              <div className="flex items-center rounded-xl border border-border bg-background px-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="h-11 w-full bg-transparent px-3 text-sm outline-none"
                />
              </div>
            </label>

            <div className="flex gap-3">
              <label className="min-w-0 flex-1 space-y-2">
                <span className="text-sm font-medium text-foreground">验证码</span>
                <input
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value)}
                  placeholder="6 位数字"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none"
                />
              </label>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-4"
                  onClick={() => void handleRequestCode()}
                  disabled={requestEmailLoginCode.isPending || cooldownSeconds > 0}
                >
                  {requestEmailLoginCode.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : cooldownSeconds > 0 ? (
                    `${cooldownSeconds}s`
                  ) : (
                    "发送验证码"
                  )}
                </Button>
              </div>
            </div>

            {queryError ? (
              <div className="w-full rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {queryError}
              </div>
            ) : null}
            {!queryError && loginError ? (
              <div className="w-full rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {loginError}
              </div>
            ) : null}

            <Button
              type="button"
              className="w-full"
              onClick={() => void handleVerifyCode()}
              disabled={verifyEmailLoginCode.isPending}
            >
              {verifyEmailLoginCode.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              登录
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
