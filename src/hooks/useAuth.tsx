export function signin() {
	window.location.href = "http://localhost:8888/login?provider=google";
}

export function signout() {
	window.location.href = "http://localhost:8888/logout?provider=google";
}
