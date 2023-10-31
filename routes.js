const express = require("express");
const router = express.Router();

const IndexController = require("./controllers/index.controller");

router.get("/", async (req, res) => {
	res.status(200).json({ ok: "ok" });
});
router.post("/lead", IndexController.active);
router.get("/search", IndexController.activeSearch);

router.post("/tag-lead", IndexController.activeTagUsingEmail);

module.exports = router;
