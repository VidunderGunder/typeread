/**
 * First draft to get a feel for it myself
 */

import { useCallback, useEffect, useState, type ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { words as mostCommonWords } from "@/utils/constants";
import { useFocusTrap } from "@mantine/hooks";
import { Command, Commands } from "./Command";
import { amountAtom, amounts } from "@/jotai";
import { useAtom } from "jotai";
import { Char } from "./Char";
import { getWordAtIndex } from "@/utils/string";

export type TyperProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

type Character = {
	char: string;
	typed: string;
	changed?: number;
};

export function Typer({ className, ...props }: TyperProps) {
	const [chars, setChars] = useState<Character[]>([]);
	const [misses, setMisses] = useState(0);
	const [problemWords, setProblemWords] = useState<string[]>([]);
	const [amount, setAmount] = useAtom(amountAtom);

	const str = chars.map((char) => char.char).join("");
	const actualAmount = str.split(" ").length;
	const isisCorrectAmount = actualAmount === amount;

	const isEmpty = chars.length === 0;

	const init = useCallback(
		function init(words = amount) {
			setChars(
				getRandomWords(words)
					.split("")
					.map((e) => ({
						char: e,
						typed: "",
					})),
			);
			setMisses(0);
			setProblemWords([]);
		},
		[amount],
	);

	useEffect(() => {
		if (isEmpty || !isisCorrectAmount) init();
	}, [isEmpty, isisCorrectAmount, init]);

	const currentIndex = chars.findIndex((char) => char.typed === "");

	console.log(currentIndex);

	const finished = !chars.some((e) => e.typed.length === 0);

	const focusTrapRef = useFocusTrap();

	let wpm = 0;
	let accuracy = 0;

	if (finished && chars[0]?.changed) {
		const timeElapsed = (Date.now() - chars[0].changed) / 1000; // seconds
		const wordsTyped = chars.length / 5; // standard metric
		wpm = Math.round((wordsTyped / timeElapsed) * 60);

		let correct = 0;
		for (const { char, typed } of chars) {
			if (char === typed) correct += 1;
		}
		accuracy = Math.round((correct / chars.length) * 100);
	}

	return (
		<div
			className={cn(
				"flex size-full select-none flex-col items-center justify-center gap-10 bg-[#232834] text-white focus-visible:outline-none focus-visible:ring-0",
				className,
			)}
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
						setChars((prev) => {
							const newChars = [...prev];
							const prevIndex = currentIndex - 1;
							newChars[prevIndex] = {
								char: chars[prevIndex].char,
								typed: "",
							};
							return newChars;
						});
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
						return;
					}
				}}
			/>
			<div className="flex gap-5">
				<div className="rounded-xl bg-black/20 p-1">
					<div className="flex">
						{amounts.map((a) => {
							return (
								<button
									type="button"
									key={a}
									disabled={a === amount}
									onClick={() => {
										setAmount(a);
										init(a);
									}}
									className={cn(
										"rounded-lg px-4 py-1.5",
										"not-disabled:cursor-pointer focus-visible:outline-none focus-visible:ring-0",
										amount === a ? "bg-white/5" : "",
									)}
								>
									{a}
								</button>
							);
						})}
					</div>
				</div>
				<Commands
					commands={[
						{
							keyboard_key: "Enter",
							modifiers: [],
							label: "New",
							handler(event) {
								event.preventDefault();
								init();
							},
						},
					]}
				/>
			</div>
			<div className="max-w-[70dvw] font-bold text-xl">
				{chars.map((char, i) => {
					return (
						<span key={[...Object.values(char), i].join("-")}>
							<Char char={char} isCurrent={currentIndex === i} />
						</span>
					);
				})}
			</div>
			{finished && (
				<div className="flex max-w-[300px] flex-col items-center gap-5 font-bold text-[#4c5874]">
					<div>
						<div>{wpm} WPM</div>
						<div>{accuracy}% Accuracy</div>
						<div>{misses} Misses</div>
						{problemWords.length > 0 && (
							<div className="mt-5 flex flex-col">
								Problematic words:{" "}
								<div className="inline-flex flex-wrap gap-3">
									{problemWords.map((word, i) => {
										function practice() {
											setChars(
												Array.from({ length: amount })
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
										return (
											<button
												type="button"
												key={word}
												className="relative flex cursor-pointer gap-2 text-center not-disabled:hover:text-white"
												onClick={practice}
											>
												{i < 10 && (
													<Command
														keyboard_key={"Digit" + (i + 1)}
														handler={(e) => {
															e.preventDefault();
															practice();
														}}
													/>
												)}
												{word}
											</button>
										);
									})}
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

function getRandomWords(length = 25) {
	let str = "";

	for (let i = 0; i < length; i++) {
		str +=
			mostCommonWords[
				Math.max(0, Math.floor(Math.random() * mostCommonWords.length - 1))
			] + " ";
	}

	return str.trimEnd();
}
