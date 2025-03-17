if (!process.env.VERCEL_ENV) {
	import("node:child_process").then(({ execSync }) => {
		execSync("cd backend && go mod tidy", { stdio: "inherit" });
	});
}
