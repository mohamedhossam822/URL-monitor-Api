import express from 'express';
const router = express.Router();
import * as URLMangementController from '../Controllers/URLMangementController.js';
import * as AuthMiddleware  from '../Middlewares/AuthMiddleware.js';
router.get("/GetURLDetails/:checkName",AuthMiddleware.authenticate,URLMangementController.getURLDetails);
router.post("/Add",AuthMiddleware.authenticate,URLMangementController.addURLCheck);
router.put("/Update",AuthMiddleware.authenticate,URLMangementController.updateURLCheck)
router.delete("/Delete/:checkName",AuthMiddleware.authenticate,URLMangementController.deleteURLCheck)

router.get("/GetURLDetailsByTag/:tagName",AuthMiddleware.authenticate,URLMangementController.getURLDetailsByTag);
router.post("/AddTagsWithCheckNames",AuthMiddleware.authenticate,URLMangementController.addTagsWithCheckNames);

export {router};