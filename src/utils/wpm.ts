import type { Character } from "@/types";

/*
export type Character = {
	char: string;
	typed: string;
	changed?: number;
};
*/

export function getWpm({
	chars,
	maxChars,
	cursorIndex,
}: { chars: Character[]; maxChars?: number; cursorIndex?: number }) {
	// Limit the characters array if maxChars is provided.
	const effectiveChars =
		typeof maxChars === "number" ? chars.slice(0, maxChars) : chars;

	// Use cursorIndex if provided, otherwise use the full length.
	const index =
		typeof cursorIndex === "number" ? cursorIndex : effectiveChars.length;

	// If no characters have been typed, return 0.
	if (index <= 0) return 0;

	// Find the first character with a valid "changed" timestamp.
	const startChar = effectiveChars.find((c) => typeof c.changed === "number");
	// The end character is the one at position index - 1.
	const endChar = effectiveChars[index - 1];

	// If either the start or end times are missing, we cannot compute WPM.
	if (
		!startChar ||
		!endChar ||
		typeof startChar.changed !== "number" ||
		typeof endChar.changed !== "number"
	) {
		return 0;
	}

	const startTime = startChar.changed;
	const endTime = endChar.changed;

	// Calculate the elapsed time in minutes.
	const elapsedTimeMinutes = (endTime - startTime) / 60000;

	// Avoid division by zero or negative time.
	if (elapsedTimeMinutes <= 0) return 0;

	// For WPM, use the standard of 5 characters per word.
	const numChars = index; // Count of characters typed.
	const wordsTyped = numChars / 5;
	const wpm = wordsTyped / elapsedTimeMinutes;

	return Math.round(wpm);
}
