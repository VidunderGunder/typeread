import type { Character } from "@/types";

export function getWpm({
	chars,
	maxChars,
	cursorIndex,
}: { chars: Character[]; maxChars?: number; cursorIndex?: number }): number {
	maxChars ??= 20;
	cursorIndex ??= 0;

	if (cursorIndex < maxChars) return 0;

	const firstIndex = Math.max(0, cursorIndex - maxChars);
	const subset = chars.slice(firstIndex, cursorIndex);

	const firstTimestamp = subset.find((c) => c.changed !== undefined)?.changed;
	const lastTimestamp = subset[subset.length - 1]?.changed;

	if (firstTimestamp === undefined || lastTimestamp === undefined) return 0;

	// Calculate the elapsed time in minutes.
	const durationMs = lastTimestamp - firstTimestamp;
	if (durationMs <= 0) return 0;
	const durationMinutes = durationMs / 60000;

	// Count the number of correct characters (matching the expected char).
	const correctCount = subset.filter((c) => c.typed === c.char).length;

	// Standard formula: (correct characters / 5) per minute
	const wpm = correctCount / 5 / durationMinutes;

	return Math.round(wpm);
}
