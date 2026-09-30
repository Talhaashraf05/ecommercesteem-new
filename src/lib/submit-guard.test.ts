import { describe, expect, it } from "vitest";
import { createSubmitGuard } from "./submit-guard";

const deferred = () => {
  let resolve!: () => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe("createSubmitGuard", () => {
  it("drops a second submit while the first is in flight", async () => {
    const guard = createSubmitGuard();
    const d = deferred();
    let calls = 0;
    const first = guard.run(() => {
      calls++;
      return d.promise;
    });
    const second = await guard.run(async () => {
      calls++;
    });
    expect(second).toBe(false);
    expect(guard.busy).toBe(true);
    d.resolve();
    expect(await first).toBe(true);
    expect(calls).toBe(1);
    expect(guard.busy).toBe(false);
  });

  it("starts the task synchronously (so FormData can be read before any await)", () => {
    const guard = createSubmitGuard();
    let started = false;
    void guard.run(async () => {
      started = true;
    });
    expect(started).toBe(true);
  });

  it("clears the flag when the task throws, so the form can be resubmitted", async () => {
    const guard = createSubmitGuard();
    await expect(guard.run(() => Promise.reject(new Error("chunk load failed")))).rejects.toThrow("chunk load failed");
    expect(guard.busy).toBe(false);
    expect(await guard.run(async () => {})).toBe(true);
  });
});
