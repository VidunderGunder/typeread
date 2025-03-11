import { useEffect, type ComponentProps } from "react";
import { cn } from "@/styles/utils";
import {
	bookTextAtom,
	charsAtom,
	missesAtom,
	modeAtom,
	problemWordsAtom,
	useInit,
	wpmAtom,
} from "@/jotai";
import { useAtom, useAtomValue } from "jotai";
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

	const { practice } = useInit();

	const finished = !chars.some((e) => e.typed.length === 0);
	const currentIndex = chars.findIndex((char) => char.typed === "");
	const currentLength = currentIndex === -1 ? chars.length : currentIndex;
	const lastTypedIndex = currentLength - 1;

	const show = true;

	let wpm = 0;
	let accuracy = 0;

	if (
		show &&
		chars[0]?.changed &&
		chars[1]?.typed &&
		chars[lastTypedIndex].changed
	) {
		const timeElapsed =
			(chars[lastTypedIndex].changed - chars[0].changed) / 1000; // seconds
		const wordsTyped = (currentLength - 1) / 5; // standard metric

		wpm = Math.round((wordsTyped / timeElapsed) * 60);

		let correct = 0;
		for (const { char, typed } of chars) {
			if (char === typed) correct += 1;
		}
		accuracy = Math.round((correct / currentLength) * 100);
	}

	useEffect(() => {
		if (finished && uiWpm !== 0) {
			// On finished
			setUiWpm(0);
		}
	}, [finished, uiWpm, setUiWpm]);

	const bookText = useAtomValue(bookTextAtom);
	const mode = useAtomValue(modeAtom);

	if (mode === "book" && !bookText) return null;

	return (
		<div
			className={cn(
				"flex w-full max-w-[min(700px,65dvw)] flex-col items-center gap-5 font-bold text-[#a2aeca] ",
				className,
			)}
			{...props}
		>
			<div className="pointer-events-none absolute inset-0 flex size-full items-center justify-center">
				{finished && <Sparkles />}
			</div>
			<motion.div
				className="w-full"
				initial={{
					height: 0,
					scale: 0,
				}}
				animate={
					show
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
					show
						? undefined
						: {
								duration: 0.025,
							}
				}
			>
				{show && (
					<>
						<div className="flex items-center justify-center gap-3">
							<div className="flex gap-2">
								<div>{wpm} WPM</div>
								<div>•</div>
								<div>{accuracy}% Accuracy</div>
								<div>•</div>
								<div>{misses} Misses</div>
							</div>
						</div>
						{problemWords.length > 0 && (
							<div className="relative top-3 flex flex-col items-center justify-start">
								<div
									className={cn(
										"absolute flex h-[112px] w-full flex-col items-center overflow-hidden",
										"[-webkit-mask-image:linear-gradient(to_bottom,_black_95%,_transparent_100%)] [mask-image:linear-gradient(to_bottom,_black_95%,_transparent_100%)]",
									)}
								>
									<div className="text-center font-normal italic">
										Pick a problematic word to practise:
									</div>
									<div className="inline-flex flex-wrap gap-x-1.5 gap-y-1 pt-2">
										{problemWords.map((word, i) => {
											return (
												<Command
													type="button"
													key={word}
													className="bg-black/40"
													handler={(e) => {
														e?.preventDefault();
														practice(word);
													}}
													keyboard_key={i < 9 ? "Digit" + (i + 1) : undefined}
													label={word}
												/>
											);
										})}
									</div>
								</div>
							</div>
						)}
					</>
				)}
			</motion.div>
		</div>
	);
}
