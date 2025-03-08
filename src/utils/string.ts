import type { Character } from "@/types";
import { WORDS } from "@/utils/constants";

export function getWordAtIndex(str: string, index: number) {
	let startOfWord = 0;
	let endOfWord = 0;

	let char: string | undefined = str[index];

	if (char === " ") {
		endOfWord = index;
	} else {
		for (let i = index; i < str.length; i++) {
			char = str[i];
			if (char === " ") {
				endOfWord = i;
				break;
			}
			if (i === str.length - 1) {
				endOfWord = i + 1;
				break;
			}
		}
	}

	for (let i = index - 1; i > 0; i--) {
		char = str[i];
		if (char === " " || i === 0) {
			startOfWord = i + 1;
			break;
		}
	}

	const word = str
		.split("")
		.splice(startOfWord, endOfWord - startOfWord)
		.join("");

	return word;
}

export function getRandomWords(
	{ length, words } = { length: 25, words: WORDS },
) {
	const rand = [];

	for (let i = 0; i < length; i++) {
		rand.push(words[Math.max(0, Math.floor(Math.random() * words.length - 1))]);
	}

	return rand;
}

export function splitIntoGroups(chars: Character[]) {
	const groups: Array<{ type: "word" | "space"; indices: number[] }> = [];
	let currentGroupIndices: number[] = [];
	let currentGroupType: "word" | "space" | null = null;

	for (let i = 0; i < chars.length; i++) {
		const char = chars[i];
		if (char.char === " ") {
			if (currentGroupType === "word") {
				groups.push({ type: "word", indices: currentGroupIndices });
				currentGroupIndices = [];
				currentGroupType = null;
			}
			groups.push({ type: "space", indices: [i] });
		} else {
			if (currentGroupType !== "word") {
				currentGroupType = "word";
			}
			currentGroupIndices.push(i);
		}
	}

	if (currentGroupIndices.length > 0 && currentGroupType === "word") {
		groups.push({ type: "word", indices: currentGroupIndices });
	}

	return groups;
}
