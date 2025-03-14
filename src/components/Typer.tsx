import { useRef, type ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { getWordAtIndex, splitIntoGroups } from "@/utils/string";
import { Char } from "./Char";
import {
	bookTextAtom,
	charsAtom,
	disableTyperAtom,
	missesAtom,
	modeAtom,
	problemWordsAtom,
	searchEngineAtom,
	searches,
	wpmAtom,
} from "@/jotai";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useFocusTrap } from "@mantine/hooks";
import { getWpm } from "@/utils/wpm";
import { Upload } from "./Upload";
import { WallpaperTyperBackdrop } from "./Wallpaper";
import { Command } from "./Command";
import { mod } from "@/types/keyboard";
import { motion } from "motion/react";
import { Sparkle } from "./particles/Sparkle";

export type TyperProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Typer({ className, ...props }: TyperProps) {
	const [disable] = useAtom(disableTyperAtom);
	const [chars, setChars] = useAtom(charsAtom);
	const focusTrapRef = useFocusTrap();
	const setMisses = useSetAtom(missesAtom);
	const setWpm = useSetAtom(wpmAtom);
	const [problemWords, setProblemWords] = useAtom(problemWordsAtom);

	const currentIndex = chars.findIndex((char) => char.typed === "");
	const str = chars.map((char) => char.char).join("");

	const bookText = useAtomValue(bookTextAtom);
	const mode = useAtomValue(modeAtom);

	const inputValueRef = useRef(chars.map((c) => c.typed).join(""));

	if (mode === "book" && !bookText)
		return (
			<div className={cn("", className)}>
				<Upload />
			</div>
		);

	const controlledValue = chars.map((c) => c.typed).join("");

	const isFinished = (chars[chars.length - 1]?.typed.length ?? 0) > 0;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (disable) return;
		if (isFinished) return;
		const newValue = e.target.value;

		const oldValue = inputValueRef.current;
		const newChars = [...chars];

		for (let i = 0; i < newChars.length; i++) {
			const newCharValue = newValue[i] || "";
			const oldCharValue = oldValue[i] || "";

			if (newCharValue !== oldCharValue) {
				newChars[i] = {
					...newChars[i],
					typed: newCharValue,
					changed: Date.now(),
				};

				if (
					newCharValue !== "" &&
					newCharValue !== newChars[i].char &&
					oldCharValue === ""
				) {
					setMisses((prev) => prev + 1);
					const word = getWordAtIndex(str, i);
					if (!problemWords.includes(word)) {
						setProblemWords((prev) => [...prev, word]);
					}
				}
			}
		}

		setChars(newChars);
		setWpm(
			getWpm({
				chars: newChars,
				cursorIndex: newValue.length,
			}),
		);

		inputValueRef.current = newValue;
	};

	const [searchEngine] = useAtom(searchEngineAtom);

	/**
	 * Googles the given word in a new tab
	 */
	function lookupWord(word: string) {
		const url = searches[searchEngine](word.replaceAll(/[^\w\s]/g, " ")).trim();
		window.open(url, "_blank");
	}

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
					// Native inputs are not handled correctly unless the input is considered visible by the browser
					className="absolute right-[9999px] size-[1px] text-transparent outline-none ring-0 focus-visible:outline-none"
					onKeyDown={(e) => {
						if (
							["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
								e.key,
							)
						) {
							e.preventDefault();
						}
					}}
					value={controlledValue}
					onChange={handleChange}
				/>
				{splitIntoGroups(chars).map((group, groupIndex) => {
					if (group.type === "space") {
						const charIndex = group.indices[0];
						const char = chars[charIndex];
						const isCurrentChar = currentIndex === charIndex;
						const isTyped = char.typed.length > 0;
						const isIncorrectSpace = char.char !== " " && char.typed === " ";
						const isCorrect = char.char === char.typed;

						return (
							<span key={["space", groupIndex].join("-")} className="relative">
								<Char
									isCurrent={isCurrentChar}
									char={char.char}
									typed={char.typed}
								/>
								<span className="absolute inset-y-0 top-0 left-0 z-[10] flex h-full max-h-[1.2em] w-[5px] items-center justify-center">
									{char.typed.length > 0 && char.char !== char.typed && (
										<span className="absolute inset-y-0 left-0 z-[10] flex h-full w-0 items-center justify-center">
											<span className="relative top-[1px]o left-[2.5px] aspect-square size-[4px] rounded bg-red-600" />
										</span>
									)}
									{isCurrentChar && (
										<span className="absolute inset-0 flex items-center justify-center">
											<Cursor />
										</span>
									)}
									{isTyped && !isCorrect && (
										<span className="pointer-events-none absolute inset-0 flex size-full items-center justify-center text-[#bc2030]">
											<span className="relative bottom-3.5 text-xs">
												{isIncorrectSpace ? "␣" : char.typed}
											</span>
										</span>
									)}
									<span className="pointer-events-none absolute inset-0 size-full">
										{char.typed.length > 0 && char.typed !== " " && (
											<Sparkle
												className={cn(
													"-top-1",
													!isCorrect && "-top-3 bg-red-400",
												)}
											/>
										)}
									</span>
								</span>
							</span>
						);
					}

					const isCurrentWord = [
						...group.indices,
						group.indices[group.indices.length - 1] + 1,
					].includes(currentIndex);

					return (
						<span
							key={["word", groupIndex].join("-")}
							className="whitespace-nowrap"
						>
							{isCurrentWord && (
								<Command
									className="hidden"
									modifiers={[mod]}
									keyboard_key="KeyI"
									handler={() => {
										const word = group.indices
											.map((i) => chars[i].char)
											.join("");
										lookupWord(word);
									}}
								/>
							)}
							{group.indices.map((charIndex) => {
								const char = chars[charIndex];
								const isCurrentChar = currentIndex === charIndex;

								return (
									<span
										className="relative flex-inline items-center justify-center overflow-visible"
										key={charIndex}
									>
										{isCurrentChar && (
											<span className="absolute inset-0 flex items-center justify-center overflow-visible">
												<Cursor />
											</span>
										)}
										<Char
											decorations
											className={cn(
												group.isWrong
													? char.char === char.typed
														? "rounded-2xl text-red-300/75"
														: "rounded-2xl text-red-600/25"
													: "",
											)}
											char={char.char}
											typed={char.typed}
											isCurrent={isCurrentChar}
										/>
									</span>
								);
							})}
						</span>
					);
				})}
			</div>
		</WallpaperTyperBackdrop>
	);
}

type CursorProps = {
	//
} & ComponentProps<typeof motion.div>;

function Cursor({ className, ...props }: CursorProps) {
	return (
		<motion.div
			animate={{ opacity: [1, 0, 1] }}
			transition={{
				duration: 1,
				ease: "easeInOut",
				repeat: Number.POSITIVE_INFINITY,
				repeatType: "loop",
			}}
			className={cn(
				"absolute bottom-1 left-[-0.5px] h-[75%] w-[1px] rounded-full bg-amber-100/65",
				className,
			)}
			{...props}
		/>
	);
}
