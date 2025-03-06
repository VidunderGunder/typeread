import { atomWithStorage } from "jotai/utils";
import type { Character } from "./types";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { getRandomWords } from "./utils/string";
import { useCallback } from "react";

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

export const charsAtom = atom<Character[]>([]);
export const missesAtom = atom<number>(0);
export const problemWordsAtom = atom<string[]>([]);

export function useInit() {
	const setChars = useSetAtom(charsAtom);
	const setMisses = useSetAtom(missesAtom);
	const [problemWords, setProblemWords] = useAtom(problemWordsAtom);
	const amount = useAtomValue(amountAtom);

	const init = useCallback(
		function init(length = amount) {
			setChars(
				[...problemWords, ...getRandomWords(length - problemWords.length)]
					.join(" ")
					.split("")
					.map((e) => ({
						char: e,
						typed: "",
					})),
			);
			setMisses(0);
			setProblemWords([]);
		},
		[
			amount,
			problemWords,
			problemWords.length,
			setChars,
			setMisses,
			setProblemWords,
		],
	);

	function practice(word: string) {
		setChars(
			Array.from({ length: 10 })
				.map(() => word)
				.join(" ")
				.split("")
				.map((e) => ({
					char: e,
					typed: "",
				})),
		);
		setMisses(0);
		setProblemWords([]);
	}

	return { init, practice };
}
