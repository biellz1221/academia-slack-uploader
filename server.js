// EXPRESS

require("dotenv").config();

const routes = require("./routes");

const express = require("express");
const web = express();
const cors = require("cors");

web.use(cors());

web.use(express.json());
web.use(express.urlencoded()); // to support URL-encoded bodies
// web.use(express.multipart())

web.use("/", routes);

web.listen(process.env.PORT, () => {
	console.log(`App listening at port http://localhost:${process.env.PORT}`);
});
