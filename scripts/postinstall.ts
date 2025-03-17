if (process.env.NODE_ENV !== "production") {
	import("node:child_process").then(({ execSync }) => {
		execSync("cd backend && go mod tidy", { stdio: "inherit" });
	});
}
