import { atomWithReset, atomWithStorage, useResetAtom } from "jotai/utils";
import type { Character } from "./types";
import {
	atom,
	getDefaultStore,
	useAtom,
	useAtomValue,
	useSetAtom,
} from "jotai";
import { getRandomWords } from "./utils/string";
import { useCallback, useEffect } from "react";
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
export const disableTyperAtom = atom(false);

export const searchEngines = [
	"Google",
	"DuckDuckGo",
	"Brave",
	"Bing",
	"Yahoo",
	"YouTube",
	"TikTok",
	"Reddit",
	"Dictionary",
] as const;
export type SearchEngine = (typeof searchEngines)[number];
export const searches = {
	Google: (term: string) => `https://www.google.com/search?q=${term}`,
	DuckDuckGo: (term: string) => `https://www.duckduckgo.com/?q=${term}`,
	Bing: (term: string) => `https://www.bing.com/search?q=${term}`,
	Yahoo: (term: string) => `https://www.yahoo.com/search?p=${term}`,
	Brave: (term: string) => `https://search.brave.com/search?q=${term}`,
	YouTube: (term: string) =>
		`https://www.youtube.com/results?search_query=${term}`,
	TikTok: (term: string) => `https://www.tiktok.com/search?q=${term}`,
	Reddit: (term: string) => `https://www.reddit.com/search/?q=${term}`,
	Dictionary: (term: string) => `https://www.dictionary.com/browse/${term}`,
} as const satisfies Record<SearchEngine, (term: string) => void>;
export const searchEngineAtom = atomWithStorage<SearchEngine>(
	"search-engine",
	"Google",
);

export const amounts = [10, 25, 50, 100] as const;
export type Amount = (typeof amounts)[number];
export const amountAtom = atomWithStorage<Amount>("amount", 25);

export const wallpaperAtom = atomWithStorage<string>("wallpaper", "mushrooms");

export const wpmAtom = atomWithReset<number>(0);
export const charsAtom = atom<Character[]>([]);
export const missesAtom = atomWithReset<number>(0);
export const problemWordsAtom = atomWithReset<string[]>([]);

export const typerStateAtom = atom<"finished" | "not-started" | "in-progress">(
	(get) => {
		const chars = get(charsAtom);

		if (
			chars.length === 0 ||
			chars[0]?.typed === "" ||
			chars[0]?.typed === undefined
		) {
			return "not-started";
		}

		if ((chars[chars.length - 1]?.typed.length ?? 0) > 0) {
			return "finished";
		}

		return "in-progress";
	},
);
export function useTyperState() {
	return useAtomValue(typerStateAtom);
}

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

export function useBook() {
	const [bookTitle, setBookTitle] = useAtom(bookTitleAtom);
	const setBookIndex = useSetAtom(bookIndexAtom);
	const setBookCover = useSetAtom(bookCoverAtom);
	const setBookChapterIndicies = useSetAtom(bookChapterIndiciesAtom);
	const setBookText = useSetAtom(bookTextAtom);

	const store = getDefaultStore();

	const [books, setBooks] = useAtom(booksAtom);
	const bookOutdated: Book | undefined =
		books.find((book) => book.title === bookTitle) ?? books[0];

	const getBook = useCallback((): Book => {
		return {
			title: bookTitle,
			index: store.get(bookIndexAtom),
			cover: store.get(bookCoverAtom),
			chapterIndicies: store.get(bookChapterIndiciesAtom),
			text: store.get(bookTextAtom),
		};
	}, [bookTitle, store.get]);

	const setBook = useCallback(
		(newBook: Book) => {
			const currentBook = getBook();

			setBooks((prev) => {
				const newBooks = [...prev];
				const index = newBooks.findIndex(
					(book) => book.title === currentBook.title,
				);

				if (index !== -1) newBooks[index] = currentBook;

				return newBooks;
			});

			setBookTitle(newBook.title);
			setBookIndex(newBook.index);
			setBookCover(newBook.cover);
			setBookChapterIndicies(newBook.chapterIndicies);
			setBookText(newBook.text);
		},
		[
			setBookIndex,
			setBookCover,
			setBookChapterIndicies,
			setBookText,
			setBookTitle,
			setBooks,
			getBook,
		],
	);

	return {
		/**
		 * Out-of-date, use global paramaters for up to date values
		 */
		bookOutdated,
		/**
		 * Get up-to-date book
		 */
		getBook,
		setBook,
	};
}

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

export function UseInit() {
	const { init } = useInit();

	useEffect(() => {
		init();
	}, [init]);

	return null;
}
