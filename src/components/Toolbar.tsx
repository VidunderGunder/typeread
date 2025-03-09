import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { Commands, type CommandType } from "./Command";
import { useAtom, useAtomValue } from "jotai";
import {
	amountAtom,
	amounts,
	modeAtom,
	modes,
	problemWordsAtom,
	useInit,
} from "@/jotai";

export type ToolbarProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Toolbar({ className, ...props }: ToolbarProps) {
	const [amount, setAmount] = useAtom(amountAtom);
	const [mode, setMode] = useAtom(modeAtom);
	const problemWords = useAtomValue(problemWordsAtom);
	const { init } = useInit();

	return (
		<div className={cn("flex gap-5", className)} {...props}>
			<div className="rounded-xl bg-black/20 p-1">
				<div className="flex">
					{modes.map((m) => {
						return (
							<button
								type="button"
								key={m}
								disabled={m === mode}
								onClick={() => {
									setMode(m);
									// init({
									// 	amount,
									// 	mode: m,
									// 	problemWords,
									// });
								}}
								className={cn(
									"rounded-lg px-4 py-1.5",
									"not-disabled:cursor-pointer focus-visible:outline-none focus-visible:ring-0",
									mode === m ? "bg-white/5" : "",
								)}
							>
								{m}
							</button>
						);
					})}
				</div>
			</div>
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
									// init({
									// 	amount: a,
									// 	mode,
									// 	problemWords,
									// });
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
				commands={(
					[
						{
							keyboard_key: "Enter",
							label: "Next",
							handler(event) {
								event.preventDefault();
								if (mode === "book") {
									init({
										direction: "next",
									});
									return;
								}
								init({
									problemWords,
								});
							},
						},
						mode === "book"
							? {
									keyboard_key: "KeyZ",
									modifiers: ["Meta"],
									label: "Previous",
									disabled: mode !== "book",
									handler(event) {
										event.preventDefault();
										init({
											direction: "back",
										});
									},
								}
							: null,
					] satisfies (CommandType | null)[]
				).filter(Boolean)}
			/>
		</div>
	);
}
