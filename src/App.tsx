import { Toolbar } from "@/components/Toolbar";
import { Typer } from "@/components/Typer";
import { Results } from "@/components/Results";

export function App() {
	return (
		<div className="flex size-full select-none flex-col items-center justify-center gap-10 bg-[#232834] text-white focus-visible:outline-none focus-visible:ring-0">
			<div className="flex size-full flex-col items-center py-10">
				<Toolbar />
				<div className="flex flex-1 flex-col items-center justify-center gap-10">
					<Typer />
					<Results />
				</div>
			</div>
		</div>
	);
}
