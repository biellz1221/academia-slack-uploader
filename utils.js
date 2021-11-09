function extensionExtractor(filename) {
	console.log("filename =>", filename);

	let splitString = filename.split(".");

	// console.log("filename =>", filename);

	let extension = splitString[splitString.length - 1];
	let name = filename.replace(`.${extension}`, "").toLowerCase();

	return {
		name,
		extension,
	};
}

function generateLink(filename) {
	return `https://s3.amazonaws.com/materiais.academiadoautismo.com/${filename}`;
}

module.exports = { extensionExtractor, generateLink };
