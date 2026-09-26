self.onmessage = (
  event: MessageEvent<{
    masks: Uint32Array;
    pattern: number;
    minLength: number;
    minSum: number;
  }>,
) => {
  const { masks, pattern, minLength, minSum } = event.data;
  const result = [];
  const min = minLength === 1 ? 0 : 10 ** (minLength - 1);
  for (let n = min; n < masks.length; n++) {
    if (!((masks[n] >>> pattern) & 1)) continue;
    let sum = 0,
      k = n;
    do {
      sum += k % 10;
      k = Math.floor(k / 10);
    } while (k);
    if (sum >= minSum) result.push(n);
  }
  const output = new Uint32Array(result);
  (
    self as unknown as {
      postMessage: (data: Uint32Array, transfer: Transferable[]) => void;
    }
  ).postMessage(output, [output.buffer]);
};
