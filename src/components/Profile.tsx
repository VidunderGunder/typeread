import { useState, type ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { Command } from "./Command";
import { mod } from "@/types/keyboard";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Modal } from "./Modal";

export type ProfileProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Profile({ className, ...props }: ProfileProps) {
	const isSignedIn = true;

	const [open, setOpen] = useState(false);

	return (
		<div
			className={cn("flex w-full flex-col items-stretch", className)}
			{...props}
		>
			<Command
				label={isSignedIn ? "User Profile" : "Sign in"}
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
						User Profile
					</>
				}
				footer={
					<div className="flex justify-end p-4">
						<Command
							label="Signout"
							flip
							keyboard_key="KeyO"
							handler={() => {
								alert("TODO");
							}}
						/>
					</div>
				}
			>
				Hello, there! This feature isn't ready yet
			</Modal>
		</div>
	);
}
