/**
 * Dispatcher for utility-process RPC method names → handler functions.
 */

import { batchStartHandler } from "./batchStart";
import { batchStatusHandler } from "./batchStatus";
import { batchStopHandler } from "./batchStop";
import {
  bloggerCaptureProfileHandler,
  bloggerSampleVideosHandler,
} from "./blogger";
import { installBrowserHandler } from "./installBrowser";
import { keywordCreateHandler } from "./keywordCreate";
import { keywordDeleteHandler, setKeywordRunningCheck } from "./keywordDelete";
import { keywordListHandler } from "./keywordList";
import {
  manualCaptureStartHandler,
  manualCaptureStatusHandler,
  manualCaptureStopHandler,
} from "./manualCapture";
import { keywordUpdateHandler } from "./keywordUpdate";
import { sessionResetHandler } from "./sessionReset";
import { sessionStartHandler } from "./sessionStart";
import { sessionStatusHandler } from "./sessionStatus";

import { getBatchExecutorFromContext } from "../runtime/executorContext";

export type RpcHandler = (args: unknown) => Promise<unknown>;
export type RpcDispatcher = Record<string, RpcHandler>;

// Wire the keyword-delete BATCH_BUSY check against the live executor.
setKeywordRunningCheck((id) => {
  try {
    return getBatchExecutorFromContext().isRunningForKeyword(id);
  } catch {
    return false;
  }
});

export const handlers: RpcDispatcher = {
  keywordList: keywordListHandler,
  keywordCreate: keywordCreateHandler,
  keywordUpdate: keywordUpdateHandler,
  keywordDelete: keywordDeleteHandler,
  installBrowser: installBrowserHandler,
  sessionStart: sessionStartHandler,
  sessionStatus: sessionStatusHandler,
  sessionReset: sessionResetHandler,
  batchStart: batchStartHandler,
  batchStop: batchStopHandler,
  batchStatus: batchStatusHandler,
  manualCaptureStart: manualCaptureStartHandler,
  manualCaptureStop: manualCaptureStopHandler,
  manualCaptureStatus: manualCaptureStatusHandler,
  bloggerCaptureProfile: bloggerCaptureProfileHandler,
  bloggerSampleVideos: bloggerSampleVideosHandler,
};
