import { atomWithReset, atomWithStorage, useResetAtom } from "jotai/utils";
import type { Character } from "./types";
import { atom, useAtomValue, useSetAtom } from "jotai";
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
	const bookIndex = useAtomValue(bookIndexAtom);
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
								})
							: 0,
					stay: bookIndex,
					next:
						direction === "next"
							? getNextIndex({
									text: bookText,
									currentIndex: bookIndex,
								})
							: 0,
				} satisfies Record<typeof direction, number>;

				const index = indicies[direction];

				words = bookText.substring(index).split(/[ ,]+/);
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

	return { init, practice, retry };
}

function getBackIndex({
	text,
	currentIndex,
}: {
	text: string;
	currentIndex: number;
}): number {
	// TODO
	return 0;
}

function getNextIndex({
	text,
	currentIndex,
}: {
	text: string;
	currentIndex: number;
}): number {
	// TODO
	return 0;
}
