import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { useDocumentVisibility } from "@mantine/hooks";
import { muteAtom } from "@/jotai";

export function AutoMute() {
	const setMute = useSetAtom(muteAtom);
	const visibility = useDocumentVisibility();

	useEffect(() => {
		setMute(visibility !== "visible");
	}, [visibility, setMute]);

	return null;
}
