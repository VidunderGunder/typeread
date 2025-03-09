import { atomWithReset, atomWithStorage, useResetAtom } from "jotai/utils";
import type { Character } from "./types";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { getRandomWords } from "./utils/string";
import { useCallback } from "react";
import { modeMap } from "./utils/constants";

// ASCII Text Generator:
// https://patorjk.com/software/taag/#p=display&f=Elite&t=Hello%20World

/**
▄▄▄▄·  ▄▄▄· .▄▄ · ▪   ▄▄· .▄▄ · 
▐█ ▀█▪▐█ ▀█ ▐█ ▀. ██ ▐█ ▌▪▐█ ▀. 
▐█▀▀█▄▄█▀▀█ ▄▀▀▀█▄▐█·██ ▄▄▄▀▀▀█▄
██▄▪▐█▐█ ▪▐▌▐█▄▪▐█▐█▌▐███▌▐█▄▪▐█
·▀▀▀▀  ▀  ▀  ▀▀▀▀ ▀▀▀·▀▀▀  ▀▀▀▀ 
 */

export const disableEscapeAtom = atomWithStorage("disable-escape", false);

export const amounts = [10, 25, 50, 100] as const;
export type Amount = (typeof amounts)[number];
export const amountAtom = atomWithStorage<Amount>("amount", 25);

export const wpmAtom = atomWithReset<number>(0);
export const charsAtom = atom<Character[]>([]);
export const missesAtom = atomWithReset<number>(0);
export const problemWordsAtom = atomWithReset<string[]>([]);

export const bookTextAtom = atomWithStorage<string>("book", "");
export const bookIndexAtom = atomWithStorage<number>("book-index", 0);
export const bookCoverAtom = atomWithStorage<string>("book-cover", "");
export const bookTitleAtom = atomWithStorage<string>("book-cover", "");

export const modes = ["words", "code", "book"] as const;
export type Mode = (typeof modes)[number];
export const modeAtom = atomWithStorage<Mode>("mode", "words");

let words: string[] = [];

export function useInit() {
	const setChars = useSetAtom(charsAtom);
	const resetMisses = useResetAtom(missesAtom);
	const resetProblemWords = useResetAtom(problemWordsAtom);
	const resetWpm = useResetAtom(wpmAtom);
	const amount = useAtomValue(amountAtom);
	const mode = useAtomValue(modeAtom);
	const [bookIndex, setBookIndex] = useAtom(bookIndexAtom);
	const bookText = useAtomValue(bookTextAtom);

	const init = useCallback(
		function init(
			{
				amount: a,
				mode: m,
				problemWords = [],
				direction,
			}: {
				amount?: number;
				mode?: Mode;
				problemWords?: string[];
				direction?: "back" | "stay" | "next";
			} = {
				amount,
				mode,
			},
		) {
			a ??= amount;
			m ??= mode;
			direction ??= "stay";

			if (m === "book") {
				const indicies = {
					back:
						direction === "back"
							? getBackIndex({
									text: bookText,
									currentIndex: bookIndex,
									chunk: a,
								})
							: 0,
					stay: bookIndex,
					next:
						direction === "next"
							? getNextIndex({
									text: bookText,
									currentIndex: bookIndex,
									chunk: a,
								})
							: 0,
				} satisfies Record<typeof direction, number>;

				const index = indicies[direction];

				if (direction !== "stay") setBookIndex(index);

				words = bookText.substring(index).split(/[ ]+/);
				const _ = words.slice(0, a);

				setChars(
					_.join(" ")
						.trim()
						.split("")
						.map((e) => ({
							char: e,
							typed: "",
						})),
				);
			} else {
				setChars(
					[
						...problemWords,
						...getRandomWords({
							length: a - problemWords.length,
							words: modeMap[m],
						}),
					]
						.join(" ")
						.split("")
						.map((e) => ({
							char: e,
							typed: "",
						})),
				);
			}
			resetMisses();
			resetProblemWords();
			resetWpm();
		},
		[
			amount,
			setChars,
			resetMisses,
			resetProblemWords,
			mode,
			resetWpm,
			bookIndex,
			bookText,
			setBookIndex,
		],
	);

	const practice = useCallback(
		function practice(word: string) {
			setChars(
				Array.from({ length: 5 })
					.map(() => word)
					.join(" ")
					.split("")
					.map((e) => ({
						char: e,
						typed: "",
					})),
			);
			resetMisses();
			resetProblemWords();
			resetWpm();
		},
		[setChars, resetMisses, resetProblemWords, resetWpm],
	);

	const retry = useCallback(
		function retry() {
			setChars((chars) =>
				chars.map((char) => ({
					...char,
					typed: "",
				})),
			);
			resetMisses();
			resetProblemWords();
			resetWpm();
		},
		[setChars, resetMisses, resetProblemWords, resetWpm],
	);

	const incrementBook = useCallback(() => {
		init({
			amount,
			direction: "next",
			mode: "book",
		});
	}, [amount, init]);
	const decrementBook = useCallback(() => {
		init({
			amount,
			direction: "next",
			mode: "book",
		});
	}, [amount, init]);

	return {
		init,
		practice,
		retry,
		incrementBook,
		decrementBook,
	};
}

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
