/**
 * Synchronous in-flight flag for async form submits. React state is too late for
 * this: it updates after the handler's first await, so two quick submits (Enter
 * plus click) could both get through. `run` starts the task synchronously, ignores
 * any call made while one is in flight, and always clears the flag (success,
 * early return or throw).
 */
export const createSubmitGuard = () => {
  let busy = false;
  return {
    get busy() {
      return busy;
    },
    /** Runs `task` unless one is already in flight; resolves true if it ran. */
    async run(task: () => Promise<void>): Promise<boolean> {
      if (busy) return false;
      busy = true;
      try {
        await task();
      } finally {
        busy = false;
      }
      return true;
    },
  };
};
