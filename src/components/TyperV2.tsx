import { useCallback, useEffect, useState, type ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { words as mostCommonWords } from "@/constants";
import { useFocusTrap } from "@mantine/hooks";

export type TyperProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

type Character = {
	char: string;
	typed: string;
	changed?: Date;
};

export function Typer({ className, ...props }: TyperProps) {
	const [chars, setChars] = useState<Character[]>([]);

	const isEmpty = chars.length === 0;

	const init = useCallback(function init() {
		setChars(
			getRandomWords()
				.split("")
				.map((e) => ({
					char: e,
					typed: "",
				})),
		);
	}, []);

	useEffect(() => {
		if (isEmpty) init();
	}, [isEmpty, init]);

	const currentIndex = chars.findIndex((char) => char.typed === "");

	const finished = !chars.some((e) => e.typed.length === 0);

	const focusTrapRef = useFocusTrap();

	return (
		<div
			ref={focusTrapRef}
			className={cn(
				"flex size-full flex-col items-center justify-center bg-[#232834] text-white",
				className,
			)}
			{...props}
		>
			<div className="max-w-[70dvw]">
				{chars.map((char, i) => {
					const isTyped = char.typed.length > 0;
					const isCorrect = char.char === char.typed;
					const isCurrent = currentIndex === i;

					return (
						<span
							key={[...Object.values(char), i].join("-")}
							className={cn(
								"font-bold",
								isCorrect ? "text-[#cbcdb6]" : "text-[#bc2030]",
								!isTyped && "text-[#4c5874]",
								isCurrent && "underline",
							)}
						>
							{char.char}
						</span>
					);
				})}
			</div>
		</div>
	);
}

function getRandomWords(
	{ words, length } = { words: mostCommonWords, length: 25 },
) {
	let str = "";

	for (let i = 0; i < length; i++) {
		str += words[Math.floor(Math.random() * mostCommonWords.length - 1)] + " ";
	}

	return str.trimEnd();
}
