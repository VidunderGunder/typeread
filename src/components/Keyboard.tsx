import { useCallback, useEffect, useState } from "react";
import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import { os, type KeyboardKey, type Modifier, type OS } from "@/types/keyboard";
import { Sparkle } from "./particles/Sparkle";

export type KeyboardBaseProps = {
	//
} & Omit<ComponentProps<"kbd">, "label">;

export type KeyboardProps = {
	code: KeyboardKey | Modifier;
	interactive?: boolean;
	dark?: boolean;
} & ComponentProps<"kbd">;

const platformSymbols = {
	Alt: {
		macos: <span className="relative top-[1px] text-[14px]">⌥</span>,
		windows: "Alt",
		linux: "Alt",
	},
	Control: {
		macos: <span className="relative top-[1px] text-[14px]">⌃</span>,
		windows: "Ctrl",
		linux: "Ctrl",
	},
	Meta: {
		macos: <span className="relative top-[1px] text-[14px]">⌘</span>,
		windows: "⊞",
		linux: "Meta",
	},
} as const satisfies Partial<
	Record<KeyboardKey | Modifier, Record<OS, React.ReactNode>>
>;

export const codeToLabel = {
	Space: "Space",
	Backspace: "⌫",
	Enter: "↵",
	Escape: "esc",

	// Shift
	ShiftLeft: "⇧",
	ShiftRight: "⇧",
	Shift: "⇧",

	// Control
	ControlLeft: platformSymbols.Control[os],
	ControlRight: platformSymbols.Control[os],
	Control: platformSymbols.Control[os],

	// Alt / Option
	AltLeft: platformSymbols.Alt[os],
	AltRight: platformSymbols.Alt[os],
	Alt: platformSymbols.Alt[os],

	// Meta (Command on Mac, Windows key on Windows, etc.)
	MetaLeft: platformSymbols.Meta[os],
	MetaRight: platformSymbols.Meta[os],
	Meta: platformSymbols.Meta[os],

	// Arrows
	ArrowUp: "▲",
	ArrowDown: "▼",
	ArrowLeft: "◄",
	ArrowRight: "►",

	Grave: "`",
	Minus: "-",
	Plus: "+",
	Equal: "=",
	BracketLeft: "[",
	BracketRight: "]",
	Backslash: "\\",
	Semicolon: ";",
	Quote: "'",
	Comma: ",",
	Period: ".",
	Slash: "/",
} as const satisfies Partial<Record<KeyboardKey | Modifier, React.ReactNode>>;

export function getLabelFromCode(code?: string) {
	if (!code) return code;
	if (code.slice(0, 3) === "Key") return code.slice(3);
	if (code.slice(0, 5) === "Digit") return code.slice(5);
	return code in codeToLabel
		? codeToLabel[code as keyof typeof codeToLabel]
		: code;
}

function getIsModifier(code: string): code is Modifier {
	return Object.keys(modifiers).includes(code);
}

export function useKeyboard(
	code: Modifier | KeyboardKey,
	options?: {
		onPressDown?: (code: Modifier | KeyboardKey) => void;
		onPressUp?: (code: Modifier | KeyboardKey) => void;
	},
) {
	const { onPressDown, onPressUp } = options ?? {};

	const [pressed, setPressed] = useState(false);
	const isModifier = getIsModifier(code);

	const handlePressDown = useCallback(
		function handlePress() {
			setPressed(true);
			onPressDown?.(code);
		},
		[onPressDown, code],
	);

	const handlePressUp = useCallback(
		function handlePress() {
			setPressed(false);
			onPressUp?.(code);
		},
		[onPressUp, code],
	);

	useEffect(() => {
		if (!code) return;

		function handleKeyDown(e: KeyboardEvent) {
			if (isModifier) {
				const modifier = modifiers[code as keyof typeof modifiers];
				if (modifier.codes.includes(e.code)) handlePressDown();
			} else if (e.code === code) {
				handlePressDown();
			}
		}

		function handleKeyUp(e: KeyboardEvent) {
			if (isModifier) {
				const modifier = modifiers[code as keyof typeof modifiers];
				if (modifier.codes.includes(e.code)) handlePressUp();
			} else if (e.code === code) {
				handlePressUp();
			} else if (!e.getModifierState("Meta") && !e.getModifierState("Alt")) {
				// If we suspect KeyK was stuck, we can reset it here...
				handlePressUp();
			}
		}

		function handleWindowBlur() {
			handlePressUp();
		}

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		window.addEventListener("blur", handleWindowBlur);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
			window.removeEventListener("blur", handleWindowBlur);
		};
	}, [code, isModifier, handlePressDown, handlePressUp]);

	return { pressed, isModifier };
}

export function useModifiers() {
	const { pressed: Shift } = useKeyboard("Shift");
	const { pressed: Control } = useKeyboard("Control");
	const { pressed: Alt } = useKeyboard("Alt");
	const { pressed: Meta } = useKeyboard("Meta");

	return {
		Shift,
		Control,
		Alt,
		Meta,
	};
}

const modifiers = {
	Alt: {
		codes: ["AltLeft", "AltRight"],
	},
	Control: {
		codes: ["ControlLeft", "ControlRight"],
	},
	Meta: {
		codes: ["MetaLeft", "MetaRight"],
	},
	Shift: {
		codes: ["ShiftLeft", "ShiftRight"],
	},
};

export function KeyboardBase({
	children,
	className,
	...props
}: KeyboardBaseProps) {
	return (
		<kbd
			className={cn(
				"inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-md border px-1 py-1 font-mono",
				"border-gray-400 bg-gray-400 text-gray-800 shadow-[0px_2px_0px_0px_rgba(0,0,0,0.025)]",
				"text-xs",
				className,
			)}
			{...props}
		>
			{typeof children === "string" ? children : children}
		</kbd>
	);
}

export function Keyboard({
	children,
	code,
	className,
	interactive = false,
	...props
}: KeyboardProps) {
	const label = children ?? getLabelFromCode(code);
	const { pressed: _pressed } = useKeyboard(code);
	const pressed = !interactive ? false : _pressed;
	const isModifier = getIsModifier(code);

	return (
		<KeyboardBase
			className={cn(
				"relative",
				pressed ? "bg-gray-300/85" : "",
				"flex items-center justify-center",
				"font-black",
				className,
			)}
			{...props}
		>
			<span>
				{!isModifier && !pressed && <Sparkle className="-top-2 absolute" />}
				{label}
			</span>
		</KeyboardBase>
	);
}

export function ArrowKeys({
	className,
	dark,
	interactive,
	directions = "all",
	wasd = true,
	...props
}: ComponentProps<"div"> &
	Pick<KeyboardProps, "dark" | "interactive"> & {
		wasd?: boolean;
		directions?: "all" | "horizontal" | "vertical";
	}) {
	const keyboardProps = { dark, interactive };

	return (
		<div className={cn("flex gap-2", className)}>
			{wasd && (
				<div className="flex items-end gap-0.5">
					{["all", "horizontal"].includes(directions) && (
						<Keyboard code="KeyA" {...keyboardProps} className="text-[11px]" />
					)}
					{["all", "vertical"].includes(directions) && (
						<div className="flex flex-col">
							<Keyboard
								code="KeyW"
								className="h-[15px] rounded-b-none text-[8px]"
								{...keyboardProps}
							/>
							<Keyboard
								code="KeyS"
								className="h-[15px] rounded-t-none text-[8px]"
								{...keyboardProps}
							/>
						</div>
					)}
					{["all", "horizontal"].includes(directions) && (
						<Keyboard code="KeyD" {...keyboardProps} className="text-[11px]" />
					)}
				</div>
			)}
			{/* Slanted separator like a big slash */}
			<div
				className={cn(
					"h-[20px] w-[1px] rotate-6 transform",
					dark ? "bg-gray-700" : "bg-gray-300",
				)}
			/>
			<div className="flex items-end gap-0.5" {...props}>
				{["all", "horizontal"].includes(directions) && (
					<Keyboard code="ArrowLeft" {...keyboardProps} />
				)}
				{["all", "vertical"].includes(directions) && (
					<div className="flex flex-col">
						<Keyboard
							code="ArrowUp"
							className="h-[15px] rounded-b-none"
							{...keyboardProps}
						/>
						<Keyboard
							code="ArrowDown"
							className="h-[15px] rounded-t-none"
							{...keyboardProps}
						/>
					</div>
				)}
				{["all", "horizontal"].includes(directions) && (
					<Keyboard code="ArrowRight" {...keyboardProps} />
				)}
			</div>
		</div>
	);
}
