const { S3 } = require("./s3config");

const { checkNameAvailability } = require("./utils");

async function listMaterials(bucketName) {
	try {
		const objects = await S3.listObjectsV2({
			Bucket: bucketName,
		}).promise();

		return {
			objectsArray: objects.Contents,
			namesArray: objects.Contents.map((obj) => obj.Key),
		};
	} catch (error) {
		return console.log("ERRO AO LISTAR ARQUIVOS:", error);
	}
}

async function uploadMaterial(uploadOptions) {
	const materiais = await listMaterials(uploadOptions.Bucket);

	const materialNames = materiais.namesArray;

	const finalName = checkNameAvailability(materialNames, uploadOptions.Key);

	try {
		const uploadedFile = await S3.upload({
			...uploadOptions,
			Key: finalName,
		}).promise();

		return uploadedFile;
	} catch (error) {
		console.log("err =================");
		console.error(error);
	}
}

module.exports = {
	listMaterials,
	uploadMaterial,
};
