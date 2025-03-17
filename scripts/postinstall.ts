if (!process.env.VERCEL_ENV) {
	import("node:child_process").then(({ execSync }) => {
		const cmd = "cd backend && go mod tidy";
		console.log(cmd);
		execSync(cmd, { stdio: "inherit" });
	});
}
