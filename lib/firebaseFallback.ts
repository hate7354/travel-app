export function withFirebaseReadFallback<T>(promise: Promise<T>, fallback: T, timeoutMs = 5000): Promise<T> {
  return Promise.race([
    promise.catch(() => fallback),
    new Promise<T>((resolve) => {
      window.setTimeout(() => resolve(fallback), timeoutMs);
    })
  ]);
}
