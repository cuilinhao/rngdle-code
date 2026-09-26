import { utcDay, nextStreak, makeDaily } from "./engine.mjs";
export function emptyAttempt(day, type) {
  return {
    day,
    type,
    started: false,
    finished: false,
    position: 0,
    answers: [],
    choice: -1,
    startedAt: 0,
    result: -1,
  };
}
export function validateAttempt(value, day, type) {
  const fallback = emptyAttempt(day, type);
  if (!value || value.day !== day || value.type !== type) return fallback;
  const max = type === "hunt" ? 29 : type === "quiz" ? 9 : 4;
  if (
    !Number.isInteger(value.position) ||
    value.position < 0 ||
    value.position > max ||
    !Array.isArray(value.answers) ||
    value.answers.some((x) => x !== 0 && x !== 1) ||
    value.answers.length > 10 ||
    !Number.isFinite(value.startedAt) ||
    typeof value.finished !== "boolean" ||
    typeof value.started !== "boolean" ||
    !Number.isInteger(value.choice) ||
    value.choice < -1 ||
    value.choice > (type === "hunt" ? 29 : 4) ||
    !Number.isFinite(value.result) ||
    value.result < -1 ||
    value.result > 100
  )
    return fallback;
  if (
    type === "quiz" &&
    !value.finished &&
    value.answers.length !== value.position
  )
    return fallback;
  if (value.finished && value.result < 0) return fallback;
  return { ...fallback, ...value };
}
export function grade(puzzle, attempt, scores) {
  const ns = puzzle.numbers;
  if (puzzle.type === "quiz")
    return attempt.answers.reduce(
      (sum, pick, i) =>
        sum +
        (scores[ns[i * 2 + pick]] > scores[ns[i * 2 + 1 - pick]] ? 10 : 0),
      0,
    );
  if (puzzle.type === "draft") {
    const chosen = scores[ns[attempt.choice]],
      best = Math.max(...ns.map((n) => scores[n]));
    return chosen === best
      ? 100
      : Math.round(
          (100 * ns.filter((n) => scores[n] < chosen).length) / (ns.length - 1),
        );
  }
  const chosen = scores[ns[attempt.position]];
  return Math.round(
    (100 * ns.filter((n) => scores[n] <= chosen).length) / ns.length,
  );
}
export function finishAttempt(puzzle, attempt, scores) {
  return { ...attempt, finished: true, result: grade(puzzle, attempt, scores) };
}
export function revealSpecimen(day) {
  let h = 0;
  for (const c of "specimen:art-1:" + day)
    h = (Math.imul(h, 31) + c.charCodeAt(0)) | 0;
  return (h >>> 0) % 1000001;
}
