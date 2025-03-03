export function randomUnitVector(): { x: number; y: number } {
	const theta = Math.random() * 2 * Math.PI;
	return { x: Math.cos(theta), y: Math.sin(theta) };
}

export function randomUnitVectorTopHalf(): { x: number; y: number } {
	const theta = (1 + Math.random()) * 1 * Math.PI;
	return { x: Math.cos(theta), y: Math.sin(theta) };
}
