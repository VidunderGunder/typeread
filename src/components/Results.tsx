import { useEffect, type ComponentProps } from "react";
import { cn } from "@/styles/utils";
import {
	bookIndexAtom,
	charsAtom,
	missesAtom,
	modeAtom,
	problemWordsAtom,
	useInit,
	wpmAtom,
} from "@/jotai";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Command } from "./Command";
import { motion } from "motion/react";
import { Sparkles } from "./particles/Sparkle";

export type ResultsProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Results({ className, ...props }: ResultsProps) {
	const chars = useAtomValue(charsAtom);
	const misses = useAtomValue(missesAtom);
	const problemWords = useAtomValue(problemWordsAtom);
	const [uiWpm, setUiWpm] = useAtom(wpmAtom);
	const setBookIndex = useSetAtom(bookIndexAtom);
	const mode = useAtomValue(modeAtom);

	// setBookIndex(50 * 3);

	const { practice, retry } = useInit();

	const finished = !chars.some((e) => e.typed.length === 0);

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

	useEffect(() => {
		if (finished) {
			if (uiWpm !== 0) {
				// On finished
				setUiWpm(0);
				if (mode === "book") {
					setBookIndex((prev) => {
						console.log(prev, chars.length, prev + chars.length);
						return prev + chars.length;
					});
				}
			}
		}
	}, [finished, uiWpm, setUiWpm, mode, setBookIndex, chars.length]);

	return (
		<div
			className={cn(
				"flex max-w-[400px] flex-col items-center gap-5 font-bold text-[#4c5874]",
				className,
			)}
			{...props}
		>
			<div className="pointer-events-none absolute inset-0 flex size-full items-center justify-center">
				{finished && <Sparkles />}
			</div>
			<motion.div
				initial={{
					height: 0,
					scale: 0,
				}}
				animate={
					finished
						? {
								height: "auto",
								scale: 1,
								opacity: 1,
							}
						: {
								height: 0,
								scale: 1,
								opacity: 0,
							}
				}
				transition={
					finished
						? undefined
						: {
								duration: 0.025,
							}
				}
			>
				{finished && (
					<>
						<div className="flex flex-col items-center gap-4">
							<div className="flex gap-4">
								<div>{wpm} WPM</div>
								<div>•</div>
								<div>{accuracy}% Accuracy</div>
								<div>•</div>
								<div>{misses} Misses</div>
							</div>
							<div className="flex items-center">
								<Command
									keyboard_key={"KeyR"}
									modifiers={["Meta"]}
									label="Retry"
									handler={(e) => {
										e.preventDefault();
										retry();
									}}
								/>
							</div>
						</div>
						{problemWords.length > 0 && (
							<div className="mt-5 flex flex-col items-center">
								<div className="text-center font-normal italic">
									Press a number to practice problematic words:
								</div>
								<div className="inline-flex flex-wrap gap-3 pt-5">
									{problemWords.map((word, i) => {
										return (
											<button
												type="button"
												key={word}
												className="relative flex cursor-pointer gap-2 text-center not-disabled:hover:text-white"
												onClick={() => practice(word)}
											>
												{i < 9 && (
													<Command
														keyboard_key={"Digit" + (i + 1)}
														handler={(e) => {
															e.preventDefault();
															practice(word);
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
					</>
				)}
			</motion.div>
		</div>
	);
}
