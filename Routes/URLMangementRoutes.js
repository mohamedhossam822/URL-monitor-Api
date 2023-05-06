const express = require("express");
const router = express.Router();
const URLMangementController = require('../Controllers/URLMangementController');
const { authenticate } = require('../Middlewares/AuthMiddleware');
router.get("/GetURLDetails/:checkName",authenticate,URLMangementController.getURLDetails);
router.post("/Add",authenticate,URLMangementController.addURLCheck);
router.put("/Update/",authenticate,URLMangementController.updateURLCheck)
router.delete("/Delete/:checkName",authenticate,URLMangementController.deleteURLCheck)

router.get("/GetURLDetailsByTag/:tagName",authenticate,URLMangementController.getURLDetailsByTag);
router.post("/AddTagsWithCheckNames",authenticate,URLMangementController.addTagsWithCheckNames);

module.exports = router;