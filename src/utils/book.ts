export function getBackIndex({
	text,
	currentIndex,
	chunk,
}: {
	text: string;
	currentIndex: number;
	chunk: number;
}): number {
	// If at the very start, nothing to go back.
	if (currentIndex <= 0) return 0;

	let index = currentIndex;

	// If we are in the middle of a word, backtrack to its start.
	while (index > 0 && text[index - 1] !== " " && text[index - 1] !== ",") {
		index--;
	}

	let wordsCount = 0;
	// Move backwards by CHUNK_SIZE words.
	while (index > 0 && wordsCount < chunk) {
		// Skip any separator characters (space or comma)
		while (index > 0 && (text[index - 1] === " " || text[index - 1] === ",")) {
			index--;
		}
		// Now skip backwards through one word.
		while (index > 0 && text[index - 1] !== " " && text[index - 1] !== ",") {
			index--;
		}
		wordsCount++;
	}
	return index;
}

export function getNextIndex({
	text,
	currentIndex,
	chunk,
}: {
	text: string;
	currentIndex: number;
	chunk: number;
}): number {
	// If already at (or past) the end of text, return text length.
	if (currentIndex >= text.length) return text.length;

	let index = currentIndex;

	// If currently in the middle of a word, move forward to its end.
	while (index < text.length && text[index] !== " " && text[index] !== ",") {
		index++;
	}

	// Skip any subsequent separator characters.
	while (index < text.length && (text[index] === " " || text[index] === ",")) {
		index++;
	}

	// Count the first word that we have just finished.
	let wordsCount = 1;
	// Now move forward by CHUNK_SIZE - 1 additional words.
	while (index < text.length && wordsCount < chunk) {
		// Skip over the next word.
		while (index < text.length && text[index] !== " " && text[index] !== ",") {
			index++;
		}
		wordsCount++;
		// Skip any separators between words.
		while (
			index < text.length &&
			(text[index] === " " || text[index] === ",")
		) {
			index++;
		}
	}
	return index;
}
