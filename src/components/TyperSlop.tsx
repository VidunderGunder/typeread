/**
 * AI Slop implementation to get ideas (primarily a feel for what not to do)
 */

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { cn } from "@/styles/utils";

export type TyperProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Typer({ className, ...props }: TyperProps) {
	const text = "The quick brown fox jumps over the lazy dog.";
	const [typed, setTyped] = useState("");
	const [startTime, setStartTime] = useState<number | null>(null);
	const [finished, setFinished] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// Auto-focus the container so it captures key events
	useEffect(() => {
		containerRef.current?.focus();
	}, []);

	// If user has typed the entire text, mark as finished
	useEffect(() => {
		if (typed.length === text.length) setFinished(true);
	}, [typed]);

	// Handle key events: add characters or remove them with Backspace
	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (finished) return;

		// Start the timer on the first key press
		if (!startTime) setStartTime(Date.now());

		if (e.key === "Backspace") {
			setTyped((prev) => prev.slice(0, -1));
		} else if (e.key.length === 1) {
			setTyped((prev) => prev + e.key);
		}
	};

	// Render each character with a style based on its state
	const renderText = () => {
		return text.split("").map((char, index) => {
			return (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					key={index}
					className={cn(
						"px-1",
						index === typed.length && "underline",
						index < typed.length ? "text-[#cbcdb6]" : "text-[#bc2030]",
						index > typed.length && "text-[#4c5874]",
						char === " " && "w-1.5",
					)}
				>
					{char}
				</span>
			);
		});
	};

	// Calculate WPM and accuracy when finished
	let wpm = 0;
	let accuracy = 0;
	if (finished && startTime) {
		const timeElapsed = (Date.now() - startTime) / 1000; // seconds
		const wordsTyped = text.length / 5; // standard metric
		wpm = Math.round((wordsTyped / timeElapsed) * 60);
		const correctChars = typed
			.split("")
			.filter((char, index) => char === text[index]).length;
		accuracy = Math.round((correctChars / text.length) * 100);
	}

	return (
		<div
			ref={containerRef}
			// biome-ignore lint/a11y/noNoninteractiveTabindex: <explanation>
			tabIndex={0}
			onKeyDown={handleKeyDown}
			className={cn(
				"flex size-full flex-col items-center justify-center bg-[#232834]",
				className,
			)}
			{...props}
		>
			<div className="flex flex-wrap font-semibold text-xl">{renderText()}</div>
			{finished && (
				<div className="pt-8 text-[#cbcdb6b0]">
					<p className="font-semibold text-lg">Finished!</p>
					<p>WPM: {wpm}</p>
					<p>Accuracy: {accuracy}%</p>
				</div>
			)}
		</div>
	);
}
