const { createLead, searchLead } = require("../services/activecampaign.service");

exports.active = async (req, res) => {
	const response = await createLead(req.body);

	if (response.status === "error") {
		return res.status(500).json({
			status: "error",
			data: response.error,
		});
	}
	return res.status(201).json({
		data: "Lead inserido com sucesso",
		info: response.data,
	});
};

exports.activeSearch = async (req, res) => {
	const response = await searchLead(req.body.email);

	if (response.status === "error") {
		return res.status(500).json({
			status: "error",
			data: response.error,
		});
	}
	return res.status(200).json({
		data: "Sucesso",
		info: response.data,
	});
};
