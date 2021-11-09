const { App } = require("@slack/bolt");
const stream = require("stream");
const { promisify } = require("util");
// const express = require("express");
require("dotenv").config();
const got = require("got");
var slugify = require("slugify");
const pipeline = promisify(stream.pipeline);
const {
	createWriteStream, //
	createReadStream,
	unlink,
} = require("fs");

const {
	listMaterials, //
	uploadMaterial,
} = require("./bucketManipulation");
const {
	extensionExtractor, //
	generateLink,
	returnEmoji,
	returnFilter,
} = require("./utils");

const app = new App({
	socketMode: true,
	token: process.env.SLACK_OAUTH_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	appToken: process.env.SLACK_SOCKET_TOKEN,
});

// const exapp = express();

// exapp.get("/", (req, res) => {
// 	res.send("Hello World!");
// });

app.command("/olar", async ({ ack, say }) => {
	try {
		await ack();
		say(`olar`);
	} catch (error) {
		console.log("err");
		console.error(error);
	}
});

app.command("/listar-materiais", async ({ command, ack, say }) => {
	try {
		await ack();

		const materiais = await listMaterials(process.env.AWS_BUCKET_NAME);

		if (!command.text) {
			say(">📂 *Carregando lista de materiais*");
			return materiais.objectsArray.map((material) => {
				let materialInfo = extensionExtractor(material.Key);

				say(`
					${returnEmoji(materialInfo.extension)} ${materialInfo.extension}\n🏷️ ${materialInfo.name}\n🔗 ${generateLink(material.Key)}\n\n
				`);
			});
		}

		let filter = returnFilter(command.text);

		if (filter) {
			say(">📂 *Carregando lista de materiais*");
			return materiais.objectsArray
				.filter((material) => filter.includes(extensionExtractor(material.Key).extension))
				.map((material) => {
					let materialInfo = extensionExtractor(material.Key);

					say(`
						${returnEmoji(materialInfo.extension)} *${materialInfo.extension}*\n🏷️ *${materialInfo.name}*\n🔗 ${generateLink(material.Key)}\n\n
					`);
				});
		}
		return say("Não entendi esse filtro. Os filtros possíves são: pdf, documento, imagem, audio, video");
	} catch (error) {
		console.log("err");
		console.error(error);
	}
});

app.message("upload", async ({ payload, say }) => {
	// console.log("================= Payload =================");
	// console.log(payload);
	// console.log("================= End Payload =================");
	if (!payload.files.length) return;
	say("Iniciando upload...");

	try {
		const uploadOptions = {
			Bucket: process.env.AWS_BUCKET_NAME,
			ACL: "public-read",
		};

		await Promise.all(
			payload.files.map(async (file) => {
				const fileInfo = extensionExtractor(file.name);

				await pipeline(
					got.stream(file.url_private_download, {
						headers: {
							"Authorization": `Bearer ${process.env.SLACK_OAUTH_TOKEN}`,
						},
					}),
					createWriteStream(`${slugify(fileInfo.name).toLowerCase()}.${fileInfo.extension}`)
				);

				const uploadedFile = await uploadMaterial({
					...uploadOptions,
					Body: createReadStream(`${slugify(fileInfo.name)}.${fileInfo.extension}`),
					ContentType: file.mimetype,
					Key: `${slugify(fileInfo.name)}.${fileInfo.extension}`,
				});

				say(`🏷️ *${slugify(uploadedFile.Key)}*\n🔗 ${uploadedFile.Location}`);

				unlink(`${slugify(fileInfo.name)}.${fileInfo.extension}`, (err) => {
					if (err) throw err;
					console.log(`${slugify(fileInfo.name)}.${fileInfo.extension} apagado com sucesso`);
				});
			})
		);

		return say("👍 Tarefa completada com sucesso ✅");
	} catch (error) {
		say("Deu erro");
		say(error.toString());
		console.log("err");
		console.error(error);
	}
});

(async () => {
	await app.start(process.env.PORT);
	console.log("⚡️ Bolt app started");
})();

// exapp.listen(process.env.PORT, () => {
// 	console.log(`ExApp listening`);
// });
