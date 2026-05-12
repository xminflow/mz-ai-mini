import { describe, expect, it } from "vitest";

import {
  extractXhsInitialState,
  extractXhsNoteData,
  extractXhsNoteId,
  extractXhsVideoDownloadUrlFromNote,
} from "./resolve-video-url";

describe("resolve xiaohongshu video url helpers", () => {
  it("extracts note id from supported xhs url shapes", () => {
    expect(extractXhsNoteId("https://www.xiaohongshu.com/explore/abc123XYZ?xsec=1")).toBe(
      "abc123XYZ",
    );
    expect(
      extractXhsNoteId("https://www.xiaohongshu.com/discovery/item/abc123XYZ?xsec=1"),
    ).toBe("abc123XYZ");
    expect(
      extractXhsNoteId("https://www.xiaohongshu.com/search_result/abc123XYZ?keyword=a"),
    ).toBe("abc123XYZ");
  });

  it("prefers originVideoKey and generates the xhscdn url", () => {
    expect(
      extractXhsVideoDownloadUrlFromNote({
        video: { consumer: { originVideoKey: "video/path.mp4" } },
      }),
    ).toBe("https://sns-video-bd.xhscdn.com/video/path.mp4");
  });

  it("falls back to the highest-resolution stream and prefers backup urls", () => {
    expect(
      extractXhsVideoDownloadUrlFromNote({
        video: {
          media: {
            stream: {
              h264: [
                { height: 720, masterUrl: "https://cdn.example/720.mp4" },
                {
                  height: 1080,
                  masterUrl: "https://cdn.example/1080.mp4",
                  backupUrls: ["https://cdn.example/1080-backup.mp4"],
                },
              ],
              h265: [{ height: 480, masterUrl: "https://cdn.example/480.mp4" }],
            },
          },
        },
      }),
    ).toBe("https://cdn.example/1080-backup.mp4");
  });

  it("returns null for non-video notes", () => {
    expect(extractXhsVideoDownloadUrlFromNote({})).toBeNull();
  });

  it("extracts note data from pc initial state", () => {
    const html = `<script>window.__INITIAL_STATE__={"note":{"noteDetailMap":{"abc":{"note":{"video":{"consumer":{"originVideoKey":"a\\\\u002Fb.mp4"}}}}}}}</script>`;
    const state = extractXhsInitialState(html);
    const note = extractXhsNoteData(state);
    expect(note).not.toBeNull();
    expect(note ? extractXhsVideoDownloadUrlFromNote(note) : null).toBe(
      "https://sns-video-bd.xhscdn.com/a/b.mp4",
    );
  });
});
