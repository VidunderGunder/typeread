import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { Command, CommandsWrapper } from "./Command";
import {
	disableTyperAtom,
	modeAtom,
	problemWordsAtom,
	useInit,
	useTyperState,
} from "@/jotai";
import { useAtom, useAtomValue } from "jotai";
import { mod } from "@/types/keyboard";
import { useFullscreen } from "@mantine/hooks";
import { Profile } from "./Profile";
import { Glow } from "./particles/Glow";

export type HotkeysProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Hotkeys({ className, ...props }: HotkeysProps) {
	const mode = useAtomValue(modeAtom);
	const problemWords = useAtomValue(problemWordsAtom);
	const { init, retry } = useInit();
	const { toggle } = useFullscreen();
	const [disableTyper] = useAtom(disableTyperAtom);
	const typer = useTyperState();

	return (
		<div className={cn("", className)} {...props}>
			<CommandsWrapper vertical>
				<Glow glow={typer === "finished"}>
					<Command
						flip
						disabled={disableTyper}
						keyboard_key="Enter"
						label="Next"
						handler={(event) => {
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
						}}
					/>
				</Glow>
				{mode === "book" && (
					<Command
						flip
						keyboard_key="KeyZ"
						modifiers={[mod]}
						label="Back"
						disabled={mode !== "book" || disableTyper}
						handler={(event) => {
							event?.preventDefault();
							init({
								direction: "back",
							});
						}}
					/>
				)}
				<Command
					flip
					disabled={disableTyper}
					keyboard_key="KeyR"
					modifiers={[mod]}
					label="Retry"
					handler={(event) => {
						event?.preventDefault();
						retry();
					}}
				/>
				<Command
					flip
					disabled={disableTyper}
					modifiers={[mod]}
					keyboard_key="KeyI"
					label="Definition"
				/>
				<Command
					flip
					modifiers={[mod]}
					keyboard_key="KeyF"
					handler={toggle}
					label="Fullscreen"
				/>
			</CommandsWrapper>
			<hr className="my-2 text-white/25" />
			<Profile />
		</div>
	);
}
