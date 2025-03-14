import { memo, type ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { Sparkle } from "./particles/Sparkle";

export type Character = {
	char: string;
	typed: string;
	changed?: number;
};

export type CharProps = {
	isCurrent: boolean;
	decorations?: boolean;
} & Character &
	ComponentProps<"span">;

export const Char = memo(function Char({
	children,
	className,
	char,
	typed,
	isCurrent = false,
	decorations = false,
	...props
}: CharProps) {
	const isTyped = typed.length > 0;
	const isCorrect = char === typed;
	const isIncorrectSpace = char !== " " && typed === " ";

	return (
		<span
			className={cn(
				"relative",
				"text-[#4c5874]",
				isCorrect && "text-[#cbcdb6]",
				className,
			)}
			{...props}
		>
			<span
				className={cn(
					typed.length > 0 && !isCorrect && "text-red-600",
					isCurrent && "underline",
				)}
			>
				{char}
			</span>
			{decorations && isTyped && !isCorrect && (
				<span className="pointer-events-none absolute inset-0 flex size-full items-center justify-center text-[#bc2030]">
					<span className="relative bottom-3.5 text-xs">
						{isIncorrectSpace ? "␣" : typed}
					</span>
				</span>
			)}
			{decorations && (
				<span className="pointer-events-none absolute inset-0 size-full">
					{typed.length > 0 && typed !== " " && (
						<Sparkle
							className={cn("-top-1", !isCorrect && "-top-3 bg-red-400")}
						/>
					)}
				</span>
			)}
			{children}
		</span>
	);
});
