import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { Persona } from "../index";
import { PERSONA_STORAGE_KEY } from "../persona-model";
import { STRATEGY_STORAGE_KEY } from "../strategy-model";

describe("Persona routes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    Object.defineProperty(window, "api", {
      configurable: true,
      value: {
        persona: {
          save: vi.fn().mockResolvedValue({
            schema_version: "1",
            ok: true,
            saved_at: "2026-05-14T00:00:00.000Z",
            workspace_path: "D:\\workspace",
            markdown_path: "D:\\workspace\\persona-context.md",
            json_path: "D:\\workspace\\persona-context.json",
          }),
        },
      },
    });
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderPersona(initialEntry = "/persona") {
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/persona/*" element={<Persona />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it("redirects /persona to persona settings", async () => {
    renderPersona("/persona");

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "人设设置" })).toBeInTheDocument();
    });
  });

  it("renders persona settings and saves persona draft", () => {
    vi.useFakeTimers();
    renderPersona("/persona/profile");

    fireEvent.change(screen.getByLabelText("我服务谁"), {
      target: { value: "我服务高客单咨询从业者" },
    });

    act(() => {
      vi.advanceTimersByTime(260);
    });

    const saved = window.localStorage.getItem(PERSONA_STORAGE_KEY);
    expect(saved).toContain("我服务高客单咨询从业者");
    expect(window.api.persona.save).toHaveBeenCalledWith({
      profile: expect.objectContaining({
        targetAudience: "我服务高客单咨询从业者",
      }),
    });
    expect(screen.getByRole("button", { name: "重置模板" })).toBeInTheDocument();
  });

  it("renders strategy settings and saves strategy draft", () => {
    vi.useFakeTimers();
    renderPersona("/persona/strategy");

    fireEvent.change(screen.getByLabelText("我为什么必须做这个账号"), {
      target: { value: "需要一个长期沉淀信任的内容阵地" },
    });

    act(() => {
      vi.advanceTimersByTime(260);
    });

    const saved = window.localStorage.getItem(STRATEGY_STORAGE_KEY);
    expect(saved).toContain("需要一个长期沉淀信任的内容阵地");
    expect(window.api.persona.save).toHaveBeenCalledWith({
      strategy: expect.objectContaining({
        motivation: "需要一个长期沉淀信任的内容阵地",
      }),
    });
    expect(screen.getByRole("button", { name: "重置模板" })).toBeInTheDocument();
  });

  it("hydrates persona profile draft", () => {
    window.localStorage.setItem(
      PERSONA_STORAGE_KEY,
      JSON.stringify({
        targetAudience: "我服务第一次做知识账号的咨询型从业者",
        coreProblem: "帮他们把专业经验翻译成用户听得懂的内容",
        trustReason: "我做过多年咨询，也长期复盘内容成交过程",
        expectedResult: "让用户更快建立清晰定位和稳定表达",
      }),
    );

    renderPersona("/persona/profile");

    expect(screen.getByDisplayValue("我服务第一次做知识账号的咨询型从业者")).toBeInTheDocument();
    expect(screen.getByDisplayValue("让用户更快建立清晰定位和稳定表达")).toBeInTheDocument();
  });
});
