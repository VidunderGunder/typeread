import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { getWordAtIndex, splitIntoGroups } from "@/utils/string";
import { Char } from "./Char";
import {
	bookTextAtom,
	charsAtom,
	missesAtom,
	modeAtom,
	problemWordsAtom,
	wpmAtom,
} from "@/jotai";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useFocusTrap } from "@mantine/hooks";
import { getWpm } from "@/utils/wpm";
import { Upload } from "./Upload";
import { WallpaperTyperBackdrop } from "./Wallpaper";

export type TyperProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Typer({ className, ...props }: TyperProps) {
	const [chars, setChars] = useAtom(charsAtom);
	const focusTrapRef = useFocusTrap();
	const setMisses = useSetAtom(missesAtom);
	const setWpm = useSetAtom(wpmAtom);
	const [problemWords, setProblemWords] = useAtom(problemWordsAtom);

	const currentIndex = chars.findIndex((char) => char.typed === "");
	const str = chars.map((char) => char.char).join("");
	const finished = !chars.some((e) => e.typed.length === 0);

	const bookText = useAtomValue(bookTextAtom);
	const mode = useAtomValue(modeAtom);

	if (mode === "book" && !bookText)
		return (
			<div className={cn("", className)}>
				<Upload />
			</div>
		);

	return (
		<WallpaperTyperBackdrop>
			<div
				className={cn("max-w-[min(65dvw,800px)] font-bold text-xl", className)}
				{...props}
			>
				<input
					ref={focusTrapRef}
					type="text"
					onBlur={(e) => {
						e.currentTarget.focus();
					}}
					// biome-ignore lint/a11y/noAutofocus: <explanation>
					autoFocus
					tabIndex={0}
					className="size-0 opacity-0"
					// value={chars.map((e) => e.typed)}
					// onChange={e => {
					// 	const value = e.currentTarget.value;
					// }}
					onKeyDown={(e) => {
						if (finished) return;

						if (e.key === "Backspace") {
							if (currentIndex === 0) return;
							const prevIndex = currentIndex - 1;
							const newChar = {
								char: chars[prevIndex].char,
								typed: "",
							};

							setChars((prev) => {
								const newChars = [...prev];
								newChars[prevIndex] = newChar;
								return newChars;
							});
							// setWpm(0);

							return;
						}

						if (e.key.length === 1) {
							const newChars = [...chars];
							const newChar = {
								char: chars[currentIndex].char,
								typed: e.key,
								changed: Date.now(),
							};

							newChars[currentIndex] = newChar;
							if (newChar.typed.length > 0 && newChar.typed !== newChar.char) {
								setMisses((prev) => prev + 1);
								const word = getWordAtIndex(str, currentIndex);
								if (!problemWords.includes(word)) {
									setProblemWords((prev) => [...prev, word]);
								}
							}

							setChars(newChars);
							setWpm(
								getWpm({
									chars: newChars,
									cursorIndex: currentIndex,
								}),
							);
							return;
						}
					}}
				/>
				{splitIntoGroups(chars).map((group, groupIndex) => {
					if (group.type === "space") {
						const charIndex = group.indices[0];
						const char = chars[charIndex];
						return (
							<span key={["space", groupIndex].join("-")}>
								<Char
									isCurrent={currentIndex === charIndex}
									char={char.char}
									typed={char.typed}
								/>
							</span>
						);
					}
					return (
						<span
							key={["word", groupIndex].join("-")}
							className="whitespace-nowrap"
						>
							{group.indices.map((charIndex) => {
								const char = chars[charIndex];
								return (
									<Char
										key={charIndex}
										char={char.char}
										typed={char.typed}
										isCurrent={currentIndex === charIndex}
									/>
								);
							})}
						</span>
					);
				})}
			</div>
		</WallpaperTyperBackdrop>
	);
}
