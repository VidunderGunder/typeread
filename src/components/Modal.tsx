import { useEffect, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/styles/utils";
import {
	AnimatePresence,
	motion,
	type TargetAndTransition,
} from "motion/react";
import { createPortal } from "react-dom";
import { Command } from "./Command";
import type { Transition } from "motion";
import { disableTyperAtom } from "@/jotai";
import { useSetAtom } from "jotai";

export type ModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	header?: ReactNode;
	children?: ReactNode;
	footer?: ReactNode;
} & Omit<ComponentProps<typeof motion.div>, "children">;

const transition: Transition = {
	duration: 0.1,
};

type PresenceAnimation = {
	initial: TargetAndTransition;
	animate: TargetAndTransition;
	exit: TargetAndTransition;
	transition?: Transition;
};

const plopIn: PresenceAnimation = {
	initial: {
		scale: 0.85,
		opacity: 0.5,
	},
	animate: {
		scale: 1,
		opacity: 1,
	},
	exit: {
		scale: 0.75,
		opacity: 0,
	},
	transition,
};

export function Modal({
	children,
	className,
	open,
	onOpenChange,
	footer,
	header,
	...props
}: ModalProps) {
	function handleClose() {
		onOpenChange(false);
	}

	return createPortal(
		<AnimatePresence>
			{open && (
				<>
					<motion.div
						className="fixed inset-0 flex flex-col items-center justify-center"
						initial={{
							backdropFilter: "blur(0px)",
						}}
						animate={{
							backdropFilter: "blur(5px)",
						}}
						exit={{
							backdropFilter: "blur(0px)",
						}}
						transition={transition}
					>
						<motion.button
							{...plopIn}
							type="button"
							className="absolute inset-0"
							onClick={handleClose}
						/>
						<motion.div
							{...plopIn}
							className={cn(
								"relative w-[350px] max-w-11/12 rounded-xl bg-black/50 text-white [box-shadow:0_0_0_2px_rgba(255,255,255,0.1)]",
								className,
							)}
							{...props}
						>
							<div className="flex items-center justify-between p-4">
								<div className="flex items-center gap-1 font-bold text-lg [&>.icon,.iconify]:text-2xl">
									{header}
								</div>
								<Command
									flip
									keyboard_key="Escape"
									label="Close"
									handler={handleClose}
								/>
							</div>
							<hr className="text-white/20" />
							<div className="p-4">{children}</div>
							{footer && (
								<>
									<hr className="text-white/20" />
									{footer}
								</>
							)}
						</motion.div>
					</motion.div>
					<DisableTyper />
				</>
			)}
		</AnimatePresence>,
		document.body,
	);
}

function DisableTyper() {
	const setDisableMainHotkeys = useSetAtom(disableTyperAtom);

	useEffect(() => {
		setDisableMainHotkeys(true);
		return () => {
			setDisableMainHotkeys(false);
		};
	}, [setDisableMainHotkeys]);

	return null;
}
