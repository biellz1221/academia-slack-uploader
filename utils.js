const fileTypes = {
	docTypes: ["doc", "docx", "otf", "rtf", "txt"],
	imgTypes: ["jpg", "jpeg", "gif", "svg", "png"],
	audioTypes: ["mp3", "m4a", "ogg", "wav", "aac", "flac"],
	videoTypes: ["mp4", "mkv", "avi", "webm", "mov", "wmv", "m4v"],
};

function extensionExtractor(filename) {
	let splitString = filename.split(".");

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

function checkNameAvailability(nameArray, filename) {
	let n = 1;
	if (nameArray.includes(filename)) {
		checkNameAvailability(nameArray, `${n}-${filename}`);
		n += 1;
	}
	if (n < 2) return filename;
	return `${n}-${filename}`;
}

function returnEmoji(fileType) {
	if (fileTypes.docTypes.includes(fileType)) return "📃";
	if (fileTypes.imgTypes.includes(fileType)) return "🖼️";
	if (fileTypes.audioTypes.includes(fileType)) return "🔉";
	if (fileTypes.videoTypes.includes(fileType)) return "📼";
	return "📁";
}

function returnFilter(filter) {
	switch (filter) {
		case "pdf":
			return ["pdf"];
		case "documento":
		case "document":
			return fileTypes.docTypes;
		case "imagem":
		case "image":
		case "img":
			return fileTypes.imgTypes;
		case "video":
			return fileTypes.videoTypes;
		case "audio":
			return fileTypes.audioTypes;
		default:
			return false;
	}
}

module.exports = {
	extensionExtractor,
	generateLink,
	checkNameAvailability,
	returnEmoji,
	returnFilter,
	fileTypes,
};
