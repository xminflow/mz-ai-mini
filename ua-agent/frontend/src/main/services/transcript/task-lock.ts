interface TranscriptTaskLockMetadata {
  owner: string;
  label: string;
  startedAt: string;
}

interface RunLockGranted<T> {
  ok: true;
  value: T;
}

interface RunLockRejected {
  ok: false;
  active: TranscriptTaskLockMetadata;
}

export type TranscriptTaskLockResult<T> = RunLockGranted<T> | RunLockRejected;

let activeTask: TranscriptTaskLockMetadata | null = null;

export function getActiveTranscriptTask(): TranscriptTaskLockMetadata | null {
  return activeTask;
}

export async function runWithTranscriptTaskLock<T>(
  owner: string,
  label: string,
  work: () => Promise<T>,
): Promise<TranscriptTaskLockResult<T>> {
  if (activeTask !== null) {
    return { ok: false, active: activeTask };
  }

  const task: TranscriptTaskLockMetadata = {
    owner,
    label,
    startedAt: new Date().toISOString(),
  };
  activeTask = task;

  try {
    return { ok: true, value: await work() };
  } finally {
    if (activeTask?.owner === task.owner) {
      activeTask = null;
    }
  }
}
