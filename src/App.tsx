import { Toolbar } from "@/components/Toolbar";
import { Typer } from "@/components/Typer";
import { Results } from "@/components/Results";
import { useEffect } from "react";
import { useInit } from "./jotai";
import { WPM } from "./components/WPM";
import { Upload } from "./components/Upload";
import { BookTitle } from "./components/BookTitle";
import { Hotkeys } from "./components/Hotkeys";

export function App() {
	const { init } = useInit();

	useEffect(() => {
		init();
	}, [init]);

	return (
		<>
			<div className="relative flex size-full select-none flex-col items-center justify-center gap-10 bg-[#232834] text-white focus-visible:outline-none focus-visible:ring-0">
				<div className="z-0 flex size-full flex-col items-center py-5">
					<Toolbar className="z-0" />
					<BookTitle className="absolute top-[min(max(75px,10dvh),90px)]" />
					<div className="relative top-6 z-10 flex flex-1 flex-col items-center justify-center gap-10">
						<WPM />
						<Typer />
						<Results />
					</div>
				</div>
				<Upload className="absolute bottom-4 left-4" />
				<Hotkeys className="absolute right-5 bottom-5" />
			</div>
		</>
	);
}
