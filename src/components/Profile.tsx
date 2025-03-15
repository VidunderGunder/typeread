import { useState, type ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { Command } from "./Command";
import { mod } from "@/types/keyboard";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Modal } from "./Modal";
import { useAtom } from "jotai";
import { type SearchEngine, searchEngineAtom, searchEngines } from "@/jotai";

export type ProfileProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Profile({ className, ...props }: ProfileProps) {
	const isSignedIn = false;

	const [open, setOpen] = useState(false);

	return (
		<div
			className={cn("flex w-full flex-col items-stretch", className)}
			{...props}
		>
			<Command
				label="User Profile"
				flip
				modifiers={[mod]}
				keyboard_key="KeyU"
				handler={() => {
					setOpen((prev) => !prev);
				}}
			/>
			<Modal
				open={open}
				onOpenChange={setOpen}
				header={
					<>
						<Icon icon="gridicons:user" />
						{isSignedIn ? "User Profile" : "Sign in"}
					</>
				}
				children={<SearchEngineSelect />}
				footer={
					<div className="flex justify-end p-4">
						{isSignedIn ? (
							<Command
								label="Sign out"
								flip
								keyboard_key="KeyO"
								handler={() => {
									alert("TODO");
								}}
							/>
						) : (
							<Command
								label="Sign in"
								flip
								keyboard_key="Enter"
								handler={() => {
									alert("TODO");
								}}
							/>
						)}
					</div>
				}
			/>
		</div>
	);
}

type SearchEngineSelectProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

const engineIconifyIcons = {
	Google: "logos:google-icon",
	Bing: "logos:bing",
	DuckDuckGo: "logos:duckduckgo",
	Brave: "logos:brave",
	Yahoo: "logos:yahoo",
	YouTube: "logos:youtube-icon",
	TikTok: "logos:tiktok-icon",
	Reddit: "logos:reddit-icon",
	Dictionary: "emojione-v1:blue-book",
} as const satisfies Record<SearchEngine, string>;

function SearchEngineSelect({ className, ...props }: SearchEngineSelectProps) {
	const [searchEngine, setSearchEngine] = useAtom(searchEngineAtom);

	return (
		<div className={cn("flex flex-col gap-4", className)} {...props}>
			<label className="flex flex-col gap-1 font-semibold text-sm">
				Search Engine
				<span className="font-normal text-gray-400 text-xs leading-1">
					Select your preferred search engine
				</span>
			</label>
			<div className="flex flex-wrap gap-1.5">
				{searchEngines.map((engine) => {
					const isSelected = searchEngine === engine;
					return (
						<button
							type="button"
							key={engine}
							className={cn(
								"flex not-disabled:cursor-pointer items-center justify-between gap-2 rounded-md bg-black/50 px-2.5 py-2 font-semibold text-sm transition-all duration-100 hover:bg-white/10",
								"[box-shadow:inset_0_0_0px_1px_rgba(255,255,255,0.1)]",
								isSelected ? "" : "text-white/30",
							)}
							onClick={() => {
								setSearchEngine(engine);
							}}
						>
							<span className="flex items-center gap-2">
								<Icon
									icon={engineIconifyIcons[engine]}
									className="aspect-square size-[1rem]"
								/>
								{engine}
							</span>
							{/* {isSelected && <Icon icon="ion:checkmark" className="text-lg" />} */}
						</button>
					);
				})}
			</div>
		</div>
	);
}
