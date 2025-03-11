import { atomWithReset, atomWithStorage, useResetAtom } from "jotai/utils";
import type { Character } from "./types";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { getRandomWords } from "./utils/string";
import { useCallback } from "react";
import { modeMap } from "./utils/constants";
import { getBackIndex, getNextIndex } from "./utils/book";
import { booksDefault } from "./default";

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

export const wallpaperAtom = atomWithStorage<string>("wallpaper", "mushrooms");

export const wpmAtom = atomWithReset<number>(0);
export const charsAtom = atom<Character[]>([]);
export const missesAtom = atomWithReset<number>(0);
export const problemWordsAtom = atomWithReset<string[]>([]);

export type Book = {
	title: string;
	index: number;
	cover: string;
	chapterIndicies: number[];
	text: string;
};

export const booksAtom = atomWithStorage<Book[]>("books", booksDefault);

export const bookTitleAtom = atomWithStorage<string>(
	"book-title",
	booksDefault[0].title,
);
export const bookIndexAtom = atomWithStorage<number>(
	"book-index",
	booksDefault[0].index,
);
export const bookCoverAtom = atomWithStorage<string>(
	"book-cover",
	booksDefault[0].cover,
);
export const bookChapterIndiciesAtom = atomWithStorage<number[]>(
	"book-chapter-indicies",
	booksDefault[0].chapterIndicies,
);
export const bookTextAtom = atomWithStorage<string>(
	"book-text",
	booksDefault[0].text,
);

export const modes = ["words", "code", "book"] as const;
export type Mode = (typeof modes)[number];
export const modeAtom = atomWithStorage<Mode>("mode", "book");

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

				words = bookText.substring(index).split(/[ ]+/).slice(0, a);

				setChars(
					words
						.join(" ")
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
