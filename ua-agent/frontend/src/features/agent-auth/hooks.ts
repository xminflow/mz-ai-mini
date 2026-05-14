import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  agentAuthMutationResultSchema,
  agentAuthStateResultSchema,
  emailLoginChallengeResultSchema,
  type AgentAuthState,
  type EmailLoginChallenge,
} from "@/shared/contracts/agent-auth";

export const AGENT_AUTH_QUERY_KEY = ["agent-auth"] as const;

async function parseStateResult(raw: unknown): Promise<AgentAuthState> {
  const parsed = agentAuthStateResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`agent-auth 响应未通过校验：${JSON.stringify(raw).slice(0, 200)}`);
  }
  if (!parsed.data.ok) {
    throw new Error(parsed.data.error.message);
  }
  return parsed.data.state;
}

async function parseMutationResult(raw: unknown): Promise<AgentAuthState> {
  const parsed = agentAuthMutationResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`agent-auth 响应未通过校验：${JSON.stringify(raw).slice(0, 200)}`);
  }
  if (!parsed.data.ok) {
    throw new Error(parsed.data.error.message);
  }
  return parsed.data.state;
}

async function parseEmailLoginChallengeResult(raw: unknown): Promise<EmailLoginChallenge> {
  const parsed = emailLoginChallengeResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`email-login 响应未通过校验：${JSON.stringify(raw).slice(0, 200)}`);
  }
  if (!parsed.data.ok) {
    throw new Error(parsed.data.error.message);
  }
  return parsed.data.challenge;
}

export function useAgentAuthState() {
  return useQuery<AgentAuthState, Error>({
    queryKey: AGENT_AUTH_QUERY_KEY,
    queryFn: async () => parseStateResult(await window.api.agentAuth.getState()),
    staleTime: Infinity,
  });
}

export function useRequestEmailLoginCode() {
  return useMutation<EmailLoginChallenge, Error, string>({
    mutationFn: async (email) =>
      parseEmailLoginChallengeResult(await window.api.agentAuth.requestEmailLoginCode(email)),
    onError: (error) => {
      toast.error(`发送验证码失败：${error.message}`);
    },
  });
}

export function useVerifyEmailLoginCode() {
  const queryClient = useQueryClient();
  return useMutation<AgentAuthState, Error, { loginChallengeId: string; verificationCode: string }>({
    mutationFn: async ({ loginChallengeId, verificationCode }) =>
      parseMutationResult(
        await window.api.agentAuth.verifyEmailLoginCode(loginChallengeId, verificationCode),
      ),
    onSuccess: (state) => {
      queryClient.setQueryData(AGENT_AUTH_QUERY_KEY, state);
      toast.success("登录成功");
    },
    onError: (error) => {
      toast.error(`登录失败：${error.message}`);
    },
  });
}

export function useLogoutAgentAuth() {
  const queryClient = useQueryClient();
  return useMutation<AgentAuthState, Error>({
    mutationFn: async () => parseMutationResult(await window.api.agentAuth.logout()),
    onSuccess: (state) => {
      queryClient.setQueryData(AGENT_AUTH_QUERY_KEY, state);
      toast.success("已退出登录");
    },
    onError: (error) => {
      toast.error(`退出失败：${error.message}`);
    },
  });
}
