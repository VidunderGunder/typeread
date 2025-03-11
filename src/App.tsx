import { Toolbar } from "@/components/Toolbar";
import { Typer } from "@/components/Typer";
import { Results } from "@/components/Results";
import { useEffect } from "react";
import { useInit } from "@/jotai";
import { WPM } from "@/components/WPM";
import { UploadAfter } from "@/components/Upload";
import { BookTitle } from "@/components/BookTitle";
import { Hotkeys } from "@/components/Hotkeys";
import { cn } from "@/styles/utils";
import { Wallpaper, WallpaperSelect } from "@/components/Wallpaper";
import { Fullscreen } from "./components/Fullscreen";
import { Logo } from "./components/Logo";

export function App() {
	const { init } = useInit();

	useEffect(() => {
		init();
	}, [init]);

	return (
		<>
			<div className="absolute size-full bg-[#13161c]" />
			<Wallpaper />
			<div
				className={cn(
					"relative flex size-full select-none flex-col items-center justify-center gap-10 text-white focus-visible:outline-none focus-visible:ring-0",
					"backdrop-blur-md",
				)}
			>
				<div className="z-0 flex size-full flex-col items-center py-5">
					<Toolbar className="z-0" />
					<BookTitle className="absolute top-[min(max(75px,10dvh),90px)]" />
					<div className="z-10 flex flex-1 flex-col items-center justify-center gap-10">
						<WPM />
						<div>
							<Typer />
						</div>
						<Results />
					</div>
				</div>
				<Logo className="absolute top-4 left-5" />
				<Fullscreen className="absolute top-5 right-5" />
				<UploadAfter className="absolute bottom-4" />
				<Hotkeys className="absolute right-5 bottom-5" />
				<WallpaperSelect className="absolute bottom-4 left-4" />
			</div>
		</>
	);
}
