import { useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import { useDocumentVisibility } from "@mantine/hooks";
import { firstUserGestureAtom, muteOverrideAtom } from "@/jotai";

const validUnmuteKeys: string[] = [
	"Enter",
	" ",
	"Escape",
	"Backspace",
	"Tab",
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	// All letters
	..."abcdefghijklmnopqrstuvwxyz".split(""),
	..."abcdefghijklmnopqrstuvwxyz".toUpperCase().split(""),
	// All numbers
	..."0123456789".split(""),
];

export function AutoMute() {
	const setMuteOverride = useSetAtom(muteOverrideAtom);
	const visibility = useDocumentVisibility();
	const [firstUserGesture, setFirstUserGesture] = useAtom(firstUserGestureAtom);

	useEffect(() => {
		if (!firstUserGesture) return;
		setMuteOverride(visibility !== "visible");
	}, [visibility, setMuteOverride, firstUserGesture]);

	// Effect to set mute override based on document visibility
	useEffect(() => {
		setMuteOverride(visibility !== "visible");
	}, [visibility, setMuteOverride]);

	// Effect to capture the first user gesture for enabling unmute automatically
	useEffect(() => {
		// if a gesture has already been registered, we don't need to listen further
		if (firstUserGesture) return;

		function handleClick() {
			setFirstUserGesture(true);
		}

		function handleKeydown(e: KeyboardEvent) {
			if (validUnmuteKeys.includes(e.key)) setFirstUserGesture(true);
		}

		// Register multiple gesture events with the { once: true } option,
		// so each listener is automatically removed after the event fires.
		document.addEventListener("click", handleClick, { once: true });
		document.addEventListener("keydown", handleKeydown);

		// Cleanup in case the effect unmounts before a gesture is detected.
		return () => {
			document.removeEventListener("click", handleClick);
			document.removeEventListener("keydown", handleKeydown);
		};
	}, [firstUserGesture, setFirstUserGesture]);

	return null;
}
