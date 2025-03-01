import { atomWithStorage } from "jotai/utils";

// ASCII Text Generator:
// https://patorjk.com/software/taag/#p=display&f=Elite&t=Hello%20World

/**
▄▄▄▄·  ▄▄▄· .▄▄ · ▪   ▄▄· .▄▄ · 
▐█ ▀█▪▐█ ▀█ ▐█ ▀. ██ ▐█ ▌▪▐█ ▀. 
▐█▀▀█▄▄█▀▀█ ▄▀▀▀█▄▐█·██ ▄▄▄▀▀▀█▄
██▄▪▐█▐█ ▪▐▌▐█▄▪▐█▐█▌▐███▌▐█▄▪▐█
·▀▀▀▀  ▀  ▀  ▀▀▀▀ ▀▀▀·▀▀▀  ▀▀▀▀ 
 */

export const disableEscapeAtom = atomWithStorage("disable-escape", false);
