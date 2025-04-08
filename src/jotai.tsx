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
import { processEpub } from "./utils/file";
import type { WallpaperKey } from "./components/Wallpaper";

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

export const mutePreferenceAtom = atomWithStorage("mute-preference", true);
export const muteOverrideAtom = atom(true);
/**
 * Wether the user has interacted with the page
 */
export const firstUserGestureAtom = atom(false);

export function useMute() {
	const [mutePreference] = useAtom(mutePreferenceAtom);
	const [muteOverride] = useAtom(muteOverrideAtom);
	const [firstUserGesture] = useAtom(firstUserGestureAtom);

	const mute = firstUserGesture ? muteOverride || mutePreference : false;

	return {
		mute,
	};
}

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

export const wordsPerChunks = [10, 25, 50, 100] as const;
export type WordsPerChunk = (typeof wordsPerChunks)[number];
export const wordsPerChunkAtom = atomWithStorage<WordsPerChunk>("amount", 25);

export const wallpaperAtom = atomWithStorage<WallpaperKey | "">(
	"wallpaper",
	"fireplace",
);

export const wpmAtom = atomWithReset<number>(0);
export const charsAtom = atom<Character[]>([]);
export const missesAtom = atomWithReset<number>(0);
export const problemWordsAtom = atomWithReset<string[]>([]);

export const typerStateAtom = atom<"not-started" | "in-progress" | "finished">(
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

export const booksAtom = atomWithStorage<Book[]>("books", []);

export const bookTitleAtom = atomWithStorage<string>("book-title", "");
export const bookIndexAtom = atomWithStorage<number>("book-index", 0);
export const bookCoverAtom = atomWithStorage<string>("book-cover", "");
export const bookChapterIndiciesAtom = atomWithStorage<number[]>(
	"book-chapter-indicies",
	[],
);
export const bookTextAtom = atomWithStorage<string>("book-text", "");

type Chunks = {
	last: string;
	current: string;
	next: string;
};
export const chunksAtom = atom<Chunks>((get) => {
	const index = get(bookIndexAtom);

	const text = get(bookTextAtom);
	const wordsPerChunk = get(wordsPerChunkAtom);

	const lastIndex = getBackIndex({
		text,
		words: wordsPerChunk,
		currentIndex: index,
	});
	const nextIndex = getNextIndex({
		text,
		words: wordsPerChunk,
		currentIndex: index,
	});
	const nextNextIndex = getNextIndex({
		text,
		words: wordsPerChunk,
		currentIndex: nextIndex,
	});

	const current = text.substring(index, nextIndex);
	const last = text.substring(lastIndex, index);
	const next = text.substring(nextIndex, nextNextIndex);

	return {
		last,
		current,
		next,
	};
});

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
	const amount = useAtomValue(wordsPerChunkAtom);
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
									words: a,
								})
							: 0,
					stay: bookIndex,
					next:
						direction === "next"
							? getNextIndex({
									text: bookText,
									currentIndex: bookIndex,
									words: a,
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

const epubUrl = "/alice.epub";

export function UseInit() {
	const { init } = useInit();
	const [books, setBooks] = useAtom(booksAtom);
	const { setBook } = useBook();

	const hasBook = books.length > 0;

	useEffect(() => {
		if (hasBook) return;

		async function downloadProcessAndSave() {
			try {
				const res = await fetch(epubUrl);
				const file: File = await res.blob().then((blob) => {
					return new File([blob], epubUrl, {
						type: "application/epub+zip",
					});
				});
				const newBook = await processEpub(file);

				let exists = false;

				setBooks((prev) => {
					exists = prev.some(
						(book) =>
							book.title === newBook.title || book.text === newBook.text,
					);
					if (exists) return prev;
					return [...prev, newBook];
				});
				if (exists) return;
				setBook({ ...newBook, ...booksDefault[0] });
			} catch (error) {
				console.error("Failed to fetch ebook:", error);
			}
		}

		downloadProcessAndSave();
	}, [hasBook, setBook, setBooks]);

	useEffect(() => {
		init();
	}, [init]);

	return null;
}
