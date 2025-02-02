const express = require('express');


const {
    postABudget,
    getAllBudgets,
    getASingleBudget,
    updateABudget,
    deleteABudget,
} = require("./budget.controller");


const router = express.Router();

// Routes
router.post('/create-budget',  postABudget);
router.get('/budgets', getAllBudgets);
router.get('/budget/:id', getASingleBudget);
router.put('/edit-budget/:id', updateABudget);
router.delete('/delete-budget/:id', deleteABudget);

module.exports = router;