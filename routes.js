const express = require('express');
const router = express.Router();
const Controller = require('./controller');
router.post('/update_company',Controller.update_company);
router.post('/get_company',Controller.get_company);
router.post('/update_employee',Controller.update_employee);
router.post('/create_frist_admin_employee',Controller.create_frist_admin_employee);
router.post('/get_employee',Controller.get_employee);
module.exports = router;