const AWS = require("aws-sdk");

let S3 = new AWS.S3({
	endpoint: `https://s3.${process.env.AWS_REGION}.amazonaws.com`,
	accessKeyId: process.env.AWS_KEY,
	secretAccessKey: process.env.AWS_SECRET,
});

module.exports = {
	S3,
};
