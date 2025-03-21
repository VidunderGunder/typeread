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

export function Hotkeys(props: HotkeysProps) {
	return (
		<div {...props}>
			<CommandsWrapper vertical>
				<NextCommand />
				<BackCommand />
				<RetryCommand />
				<DefinitionCommand />
				<FullscreenCommand />
			</CommandsWrapper>
			<hr className="my-2 text-white/25" />
			<Profile />
		</div>
	);
}

function NextCommand() {
	const mode = useAtomValue(modeAtom);
	const problemWords = useAtomValue(problemWordsAtom);
	const { init } = useInit();
	const [disableTyper] = useAtom(disableTyperAtom);
	const typer = useTyperState();

	return (
		<Glow glow={typer === "finished"}>
			<Command
				className={cn(typer === "finished" && "text-white")}
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
	);
}

function BackCommand() {
	const mode = useAtomValue(modeAtom);
	const { init } = useInit();
	const [disableTyper] = useAtom(disableTyperAtom);

	if (mode !== "book") return null;

	return (
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
	);
}

function RetryCommand() {
	const mode = useAtomValue(modeAtom);
	const { retry } = useInit();
	const [disableTyper] = useAtom(disableTyperAtom);

	if (mode !== "book") return null;

	return (
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
	);
}

function DefinitionCommand() {
	const [disableTyper] = useAtom(disableTyperAtom);

	return (
		<Command
			flip
			disabled={disableTyper}
			modifiers={[mod]}
			keyboard_key="KeyI"
			label="Definition"
		/>
	);
}

function FullscreenCommand() {
	const { toggle } = useFullscreen();

	return (
		<Command
			flip
			modifiers={[mod]}
			keyboard_key="KeyF"
			handler={toggle}
			label="Fullscreen"
		/>
	);
}
