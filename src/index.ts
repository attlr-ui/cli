#!/usr/bin/env node
import fs from "fs";
import https from "https";
import path from "path";
import { URL } from "url";

function downloadFile(
	url: string | https.RequestOptions | URL,
	dest: fs.PathLike
) {
	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(dest);
		https
			.get(url, (response) => {
				response.pipe(file);
				file.on("finish", () => {
					file.close(resolve);
				});
			})
			.on("error", async (err) => {
				fs.unlink(dest, () => {
					reject(err.message);
				});
			});
	});
}

async function addComponent(componentName: string) {
	const componentDirectory = path.join(
		process.cwd(),
		"AttlrUi/",
		componentName
	);

	if (!fs.existsSync(componentDirectory)) {
		try {
			// Create the component directory and all parent directories if they don't exist
			fs.mkdirSync(componentDirectory, { recursive: true });
			const githubFiles = [
				{
					url: `https://raw.githubusercontent.com/MsingathiMat/attlrUi/main/${componentName}.tsx`,
					dest: path.join(componentDirectory, `${componentName}.tsx`),
				},
			];

			try {
				await downloadFile(githubFiles[0].url, githubFiles[0].dest);

				console.log(`Component '${componentName}' added successfully.`);
			} catch (error) {
				console.error(`Error downloading files: ${error}`);
				fs.rmdirSync(componentDirectory, { recursive: true });
			}
		} catch (error) {
			console.error(`Error creating directory: ${error}`);
		}
	} else {
		console.log(`Component '${componentName}' already exists.`);
	}
}
if (process.argv.length < 4 || process.argv[2] !== "add") {
	console.log("Usage: npx attlr-ui add <componentName>");
} else {
	addComponent(process.argv[3]);
}
