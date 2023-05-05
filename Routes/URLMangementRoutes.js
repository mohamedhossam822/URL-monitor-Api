const express = require("express");
const router = express.Router();
const URLMangementController = require('../Controllers/URLMangementController');
const { Authenticate } = require('../Middlewares/AuthMiddleware');
router.get("/GetURLDetails/:checkName",Authenticate,URLMangementController.GetURLDetails);
router.post("/Add",Authenticate,URLMangementController.Add);
router.put("/Update/:checkName",Authenticate,URLMangementController.Update)
router.delete("/Delete/:checkName",Authenticate,URLMangementController.Delete)

router.get("/GetURLDetailsByTag/:tagName",Authenticate,URLMangementController.GetURLDetailsByTag);
router.post("/AddTagsWithCheckNames",Authenticate,URLMangementController.AddTagsWithCheckNames);

module.exports = router;