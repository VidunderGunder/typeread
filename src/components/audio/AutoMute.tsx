import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { useDocumentVisibility } from "@mantine/hooks";
import { muteOverrideAtom } from "@/jotai";

export function AutoMute() {
	const setMuteOverride = useSetAtom(muteOverrideAtom);
	const visibility = useDocumentVisibility();

	useEffect(() => {
		setMuteOverride(visibility !== "visible");
	}, [visibility, setMuteOverride]);

	return null;
}
