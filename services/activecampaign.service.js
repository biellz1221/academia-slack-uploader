const axios = require("axios");

exports.createLead = async (data) => {
	const { email, nome, telefone, utmValues, relacao } = data;

	const utms = [];

	utmValues.forEach((utm) => {
		utms.push({
			field: utm.field,
			value: utm.value,
		});
	});

	const lead = {
		"contact": {
			"email": email,
			"firstName": nome.split(" ")[0],
			"lastName": nome.split(" ").pop(),
			"phone": telefone,
			"fieldValues": [
				{
					"field": "22",
					"value": relacao,
				},
				...utms,
			],
		},
	};

	try {
		const response = await axios.post(`${process.env.ACTIVE_API_URL}/contact/sync`, lead, {
			headers: {
				"Api-Token": process.env.ACTIVE_API_TOKEN,
			},
		});

		await this.insertTag(response.data.contact.id);

		return {
			status: "success",
			data: response.data.contact.id,
		};
	} catch (error) {
		console.log(error);
		return {
			status: "error",
			error,
		};
	}
};

exports.searchLead = async (leadEmail) => {
	try {
		const response = await axios.get(`${process.env.ACTIVE_API_URL}/contacts?email=${leadEmail}`, {
			headers: {
				"Api-Token": process.env.ACTIVE_API_TOKEN,
			},
		});

		return {
			status: "success",
			data: response.data.contacts[0].id,
		};
	} catch (error) {
		console.log(error);
		return {
			status: "error",
			error,
		};
	}
};

exports.insertTag = async (leadID) => {
	const lead = {
		contactTag: {
			contact: leadID,
			tag: "1222", //imersão 2023
		},
	};

	try {
		const response = await axios.post(`${process.env.ACTIVE_API_URL}/contactTags`, lead, {
			headers: {
				"Api-Token": process.env.ACTIVE_API_TOKEN,
			},
		});

		return {
			status: "success",
			data: response.data,
		};
	} catch (error) {
		console.log(error);
		return {
			status: "error",
			error,
		};
	}
};

// {
//     "fieldOptions": [
//         {
//             "title": "utm_source",
//             "id": "18"
//         },
//         {
//             "title": "utm_media",
//             "id": "19"
//         },
//         {
//             "title": "utm_campaign",
//             "id": "20"
//         },
//         {
//             "title": "utm_term",
//             "id": "21"
//         },
//         {
//             "title": "Relação com o TEA",
//             "id": "22"
//         }
//     ]
// }

// ID DA TAG IMERSAO 23: 1222
