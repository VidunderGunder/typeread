import { useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import { useDocumentVisibility } from "@mantine/hooks";
import { firstUserGestureAtom, muteOverrideAtom } from "@/jotai";

export function AutoMute() {
	const setMuteOverride = useSetAtom(muteOverrideAtom);
	const visibility = useDocumentVisibility();
	const [firstUserGesture, setFirstUserGesture] = useAtom(firstUserGestureAtom);

	useEffect(() => {
		setMuteOverride(visibility !== "visible");
	}, [visibility, setMuteOverride]);

	return null;
}
