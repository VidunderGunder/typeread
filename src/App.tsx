import { Toolbar } from "@/components/Toolbar";
import { Typer } from "@/components/Typer";
import { Results } from "@/components/Results";
import { useEffect } from "react";
import { useInit } from "./jotai";
import { WPM } from "./components/WPM";

export function App() {
	const { init } = useInit();

	useEffect(() => {
		init();
	}, [init]);

	return (
		<>
			<div className="flex size-full select-none flex-col items-center justify-center gap-10 bg-[#232834] text-white focus-visible:outline-none focus-visible:ring-0 ">
				<div className="z-0 flex size-full flex-col items-center py-10">
					<Toolbar />
					<div className="flex flex-1 flex-col items-center justify-center gap-10">
						<WPM />
						<Typer />
						<Results />
					</div>
				</div>
			</div>
		</>
	);
}
