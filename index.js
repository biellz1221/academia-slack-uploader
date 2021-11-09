const { App } = require("@slack/bolt");
const stream = require("stream");
const { promisify } = require("util");
const express = require("express");
require("dotenv").config();

// const AWS = require("aws-sdk");
const got = require("got");
var slugify = require("slugify");
const { createWriteStream, createReadStream, unlink } = require("fs");

const { listMaterials, uploadMaterial } = require("./bucketManipulation");
const { extensionExtractor, generateLink } = require("./utils");

const pipeline = promisify(stream.pipeline);

const app = new App({
	socketMode: true,
	token: process.env.SLACK_OAUTH_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	appToken: process.env.SLACK_SOCKET_TOKEN,
});

const exapp = express();

exapp.get("/", (req, res) => {
	res.send("Hello World!");
});

app.command("/olar", async ({ command, ack, say }) => {
	try {
		await ack();
		// const buckets = await S3.listBuckets().promise();
		// console.log(buckets);
		// let txt = command.text; // The inputted parameters
		//   if(isNaN(txt)) {
		//       say(txt + " is not a number")
		//   } else {
		//       say(txt + " squared = " + (parseFloat(txt) * parseFloat(txt)))
		//   }
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

		materiais.objectsArray.map((material) => {
			say(`
                Material: ${extensionExtractor(material.Key).name}\nLink: ${generateLink(material.Key)}
            `);
		});
	} catch (error) {
		console.log("err");
		console.error(error);
	}
});

app.message("upload", async ({ command, payload, say }) => {
	// Replace hello with the message

	// console.log("================= Payload =================");
	// console.log(payload);
	// console.log("================= End Payload =================");

	const fileInfo = extensionExtractor(payload.files[0].name);

	say("Iniciando upload...");

	// let stream = null;

	try {
		// const stream =

		const uploadOptions = {
			Bucket: process.env.AWS_BUCKET_NAME,
			Key: `${slugify(fileInfo.name)}.${fileInfo.extension}`,
			ACL: "public-read",
			ContentType: payload.files[0].mimetype,
			// Body: file,
			// ContentLength: payload.files[0].size,
		};

		// say("Enviando arquivo para o servidor");

		await pipeline(
			got.stream(payload.files[0].url_private_download, {
				headers: {
					"Authorization": `Bearer ${process.env.SLACK_OAUTH_TOKEN}`,
				},
			}),
			createWriteStream(`${slugify(fileInfo.name)}.${fileInfo.extension}`)
		);
		const uploadedFile = await uploadMaterial({
			...uploadOptions,
			Body: createReadStream(`${slugify(fileInfo.name)}.${fileInfo.extension}`),
		});
		say("Arquivo enviado com sucesso");
		say(`Material: ${slugify(fileInfo.name)}\nLink: ${uploadedFile.Location}`);
		return unlink(`${slugify(fileInfo.name)}.${fileInfo.extension}`, (err) => {
			if (err) throw err;
			console.log(`${slugify(fileInfo.name)}.${fileInfo.extension} apagado com sucesso`);
		});
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

exapp.listen(process.env.PORT, () => {
	console.log(`ExApp listening`);
});
