import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { Commands, type CommandType } from "./Command";
import { disableTyperAtom, modeAtom, problemWordsAtom, useInit } from "@/jotai";
import { useAtom, useAtomValue } from "jotai";
import { mod } from "@/types/keyboard";
import { useFullscreen } from "@mantine/hooks";
import { Profile } from "./Profile";

export type HotkeysProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Hotkeys({ className, ...props }: HotkeysProps) {
	const mode = useAtomValue(modeAtom);
	const problemWords = useAtomValue(problemWordsAtom);
	const { init, retry } = useInit();
	const { toggle } = useFullscreen();
	const [disableTyper] = useAtom(disableTyperAtom);

	return (
		<div className={cn("", className)} {...props}>
			<Commands
				flip
				vertical
				commands={(
					[
						{
							disabled: disableTyper,
							keyboard_key: "Enter",
							label: "Next",
							handler(event) {
								event?.preventDefault();
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
									modifiers: [mod],
									label: "Back",
									disabled: mode !== "book" || disableTyper,
									handler(event) {
										event?.preventDefault();
										init({
											direction: "back",
										});
									},
								}
							: null,
						{
							disabled: disableTyper,
							keyboard_key: "KeyR",
							modifiers: [mod],
							label: "Retry",
							handler: (event) => {
								event?.preventDefault();
								retry();
							},
						},
						{
							modifiers: [mod],
							keyboard_key: "KeyF",
							handler: toggle,
							label: "Fullscreen",
						},
						{
							disabled: disableTyper,
							modifiers: [mod],
							keyboard_key: "KeyI",
							label: "Definition",
						},
					] satisfies (CommandType | null)[]
				).filter(Boolean)}
			/>
			<hr className="my-2 text-white/25" />
			<Profile />
		</div>
	);
}
