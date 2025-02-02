const express = require('express');


const {
    postABudget,
    getAllBudgets,
    getASingleBudget,
    updateABudget,
    deleteABudget,
} = require("./budget.controller");


const router = express.Router();


router.get("/test-email", async (req, res) => {
    try {
        console.log("📩 Sending test email...");

        await sendBudgetCreationEmail("your-email@example.com", {
            name: "Test Budget",
            amount: 100,
            category: "Test",
            description: "Testing email sending",
            startDate: new Date(),
            endDate: new Date(),
        });

        res.json({ message: "Test email sent!" });
    } catch (error) {
        console.error("❌ Failed to send test email:", error.message);
        res.status(500).json({ message: "Failed to send test email.", error: error.message });
    }
});


// Routes
router.post('/create-budget',  postABudget);
router.get('/budgets', getAllBudgets);
router.get('/budget/:id', getASingleBudget);
router.put('/edit-budget/:id', updateABudget);
router.delete('/delete-budget/:id', deleteABudget);

module.exports = router;