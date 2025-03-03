import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { Sparkle } from "./particles/Sparkle";

export type Character = {
	char: string;
	typed: string;
	changed?: number;
};

export type CharProps = {
	char: Character;
	isCurrent: boolean;
} & ComponentProps<"span">;

export function Char({
	children,
	className,
	char,
	isCurrent = false,
	...props
}: CharProps) {
	const isTyped = char.typed.length > 0;
	const isCorrect = char.char === char.typed;
	const isIncorrectSpace = char.char !== " " && char.typed === " ";

	return (
		<span className={cn("relative", className)} {...props}>
			<span
				className={cn(
					"text-[#4c5874]",
					isCorrect && "text-[#cbcdb6]",
					isCurrent && "underline",
				)}
			>
				{char.char}
			</span>
			{isTyped && !isCorrect && (
				<span className="pointer-events-none absolute inset-0 flex size-full items-center justify-center text-[#bc2030]">
					<span className="-rotate-6 relative top-2">
						{isIncorrectSpace ? "␣" : char.typed}
					</span>
				</span>
			)}
			<span className="pointer-events-none absolute inset-0 size-full">
				{char.typed.length > 0 && char.typed !== " " && (
					<Sparkle className={cn("-top-1", !isCorrect && "bg-red-400")} />
				)}
			</span>
		</span>
	);
}
