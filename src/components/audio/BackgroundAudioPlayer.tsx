import { useRef, useEffect, useState } from "react";
import { useMute } from "@/jotai";
import mp3 from "@/../assets/fireplace.mp3";

const LOWPASS_FREQUENCY = 1000;
const GAIN_FADE_TIME = 0.5;

export function BackgroundAudioPlayer() {
	const { mute } = useMute();
	const audioContextRef = useRef<AudioContext | null>(null);
	const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
	const filterNodeRef = useRef<BiquadFilterNode | null>(null);
	const gainNodeRef = useRef<GainNode | null>(null);
	const audioBufferRef = useRef<AudioBuffer | null>(null);
	const [isReady, setIsReady] = useState(false);
	const isInitializing = useRef(false); // To prevent double SETUP logic run

	console.log({ mute });

	// --- Effect 1: Setup (Keep as is, ensure logging and cleanup are correct) ---
	// biome-ignore lint/correctness/useExhaustiveDependencies: Init only
	useEffect(() => {
		// Prevent setup logic running twice if StrictMode remounts quickly
		if (isInitializing.current) return;
		// If context somehow exists from a previous failed/interrupted run, clean it first?
		// This might add complexity, rely on cleanup function being robust.
		// if (audioContextRef.current) {
		//     console.warn("SETUP: Context existed before initialization. Trying cleanup first.");
		//     audioContextRef.current.close(); // Try closing potential zombie context
		//     // Resetting refs here might be needed too
		// }

		isInitializing.current = true; // Mark that setup LOGIC is now running

		let localAudioContext: AudioContext | null = null; // Keep track locally for cleanup on error

		const setupAudio = async () => {
			try {
				localAudioContext =
					new // biome-ignore lint/suspicious/noExplicitAny: Intentional
					(window.AudioContext || (window as any).webkitAudioContext)();
				audioContextRef.current = localAudioContext; // Assign ref

				const filterNode = localAudioContext.createBiquadFilter();
				filterNode.type = "lowpass";
				filterNode.frequency.setValueAtTime(
					LOWPASS_FREQUENCY,
					localAudioContext.currentTime,
				);
				filterNodeRef.current = filterNode; // Assign ref

				const gainNode = localAudioContext.createGain();
				gainNode.gain.setValueAtTime(
					mute ? 0 : 1,
					localAudioContext.currentTime,
				);
				gainNodeRef.current = gainNode; // Assign ref

				// ... (rest of setup: connections, fetch, decode, source creation/start) ...
				filterNode.connect(gainNode);
				gainNode.connect(localAudioContext.destination);
				const response = await fetch(mp3);
				const arrayBuffer = await response.arrayBuffer();
				const decodedBuffer =
					await localAudioContext.decodeAudioData(arrayBuffer);
				audioBufferRef.current = decodedBuffer;
				const sourceNode = localAudioContext.createBufferSource();
				sourceNode.buffer = decodedBuffer;
				sourceNode.loop = true;
				sourceNodeRef.current = sourceNode;
				sourceNode.connect(filterNode);
				sourceNode.start(0);
				// --- End of core setup ---

				setIsReady(true); // Signal readiness *after* all refs assigned and source started
			} catch (error) {
				console.error("SETUP: Failed to setup Web Audio API:", error);
				// Ensure cleanup happens if setup fails
				localAudioContext
					?.close()
					.catch((e) =>
						console.error("Error closing context on setup failure:", e),
					);
				// Nullify potentially partially assigned refs
				audioContextRef.current = null;
				filterNodeRef.current = null;
				gainNodeRef.current = null;
				sourceNodeRef.current = null;
				audioBufferRef.current = null;
				setIsReady(false); // Ensure not marked as ready if failed
				isInitializing.current = false; // Allow retry if component somehow persists?
			}
			// No finally block needed for isInitializing here if cleanup handles it
		};

		setupAudio();

		// Cleanup function
		return () => {
			const context = audioContextRef.current;
			const source = sourceNodeRef.current;
			try {
				source?.stop(0);
			} catch {}
			// Disconnect in reverse order might be safer? Source -> Filter -> Gain -> Dest
			source?.disconnect();
			filterNodeRef.current?.disconnect();
			gainNodeRef.current?.disconnect();
			context
				?.close()
				.catch((e) => console.error("Error closing AudioContext:", e));

			// Nullify refs - CRITICAL for StrictMode
			audioContextRef.current = null;
			sourceNodeRef.current = null;
			filterNodeRef.current = null;
			gainNodeRef.current = null;
			audioBufferRef.current = null;

			// Reset initializing flag ONLY when cleaning up THIS instance
			isInitializing.current = false;
			// Reset ready state too? Yes, makes sense.
			// setIsReady(false); // This causes issues if called during unmount? Maybe not needed if refs are null.
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // IMPORTANT: Still run only on mount/unmount

	// --- Effect 2: Control Volume - WITH DETAILED CHECKS ---
	useEffect(() => {
		// Check readiness state first
		if (!isReady) return;

		// Check refs individually AFTER confirming isReady
		const audioContext = audioContextRef.current;
		const gainNode = gainNodeRef.current;

		if (!audioContext) return;
		if (!gainNode) return;

		// Define the action of applying the gain setting
		const applyGain = () => {
			if (audioContext.state === "running") {
				gainNode.gain.setTargetAtTime(
					mute ? 0 : 1,
					audioContext.currentTime,
					GAIN_FADE_TIME,
				);
			} else {
				console.warn(
					`VOL_EFFECT: Cannot apply gain, context state is ${audioContext.state}`,
				);
			}
		};

		// Core Logic: Resume if suspended, then apply gain
		if (audioContext.state === "suspended") {
			audioContext
				.resume()
				.then(() => {
					applyGain(); // Apply gain after successful resume
				})
				.catch((err) => {
					console.error("VOL_EFFECT: Error resuming context:", err);
				});
		} else if (audioContext.state === "running") {
			applyGain(); // Apply gain directly
		}
	}, [mute, isReady]); // Dependencies remain the same

	return null;
}
