import { useCallback, useEffect, useState, type ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { words as mostCommonWords } from "@/constants";
import { useFocusTrap } from "@mantine/hooks";
import { Commands } from "./Command";

export type TyperProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

type Character = {
	char: string;
	typed: string;
	changed?: number;
};

const amounts = [10, 25, 50, 100] as const;

export function Typer({ className, ...props }: TyperProps) {
	const [chars, setChars] = useState<Character[]>([]);
	const [amount, setAmount] = useState<(typeof amounts)[number]>(25);

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
		},
		[amount],
	);

	useEffect(() => {
		if (isEmpty) init();
	}, [isEmpty, init]);

	const currentIndex = chars.findIndex((char) => char.typed === "");

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
			ref={focusTrapRef}
			// biome-ignore lint/a11y/noAutofocus: <explanation>
			autoFocus
			// biome-ignore lint/a11y/noNoninteractiveTabindex: <explanation>
			tabIndex={0}
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
					setChars((prev) => {
						const newChars = [...prev];
						newChars[currentIndex] = {
							char: chars[currentIndex].char,
							typed: e.key,
							changed: Date.now(),
						};
						return newChars;
					});
					return;
				}
			}}
			className={cn(
				"flex size-full select-none flex-col items-center justify-center gap-4 bg-[#232834] text-white focus-visible:outline-none focus-visible:ring-0",
				className,
			)}
			{...props}
		>
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
					const isTyped = char.typed.length > 0;
					const isCorrect = char.char === char.typed;
					const isCurrent = currentIndex === i;
					const isIncorrectSpace = char.char !== " " && char.typed === " ";

					return (
						<span
							key={[...Object.values(char), i].join("-")}
							className={cn(
								isCorrect ? "text-[#cbcdb6]" : "text-[#bc2030]",
								(!isTyped || isIncorrectSpace) && "text-[#4c5874]",
								isCurrent && "underline",
							)}
						>
							{char.typed !== "" && !isIncorrectSpace ? char.typed : char.char}
						</span>
					);
				})}
			</div>
			{finished && (
				<div className="flex flex-col items-center gap-5 font-bold text-[#4c5874]">
					<div>
						<div>{wpm} WPM</div>
						<div>{accuracy}% Accuracy</div>
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
			mostCommonWords[Math.floor(Math.random() * mostCommonWords.length - 1)] +
			" ";
	}

	return str.trimEnd();
}
