const Budget = require("./budget.model");


// Create a new budget
const postABudget = async (req, res) => {
    try {
        const { name, amount, category, description, userId, startDate, endDate } = req.body;

        if (!name || !amount || !category || !startDate || !endDate) {
            return res.status(400).json({ message: 'All required fields must be provided.' });
        }

        const budget = new Budget({ name, amount, category, description, userId, startDate, endDate });
        await budget.save();

        res.status(201).json({ message: 'Budget created successfully.', budget });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create budget.', error: error.message });
    }
};


// Get all budgets
const getAllBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find();
        res.status(200).json(budgets);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve budgets.', error: error.message });
    }
};


// Get a single budget by ID
const getASingleBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const budget = await Budget.findById(id);

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found.' });
        }

        res.status(200).json(budget);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve budget.', error: error.message });
    }
};


// Update a budget by ID
const updateABudget = async (req, res) => {
    const { id } = req.params;
    let updatedData = req.body;

    // Parse dates explicitly (if they exist in the update data)
    if (updatedData.startDate) {
        updatedData.startDate = new Date(updatedData.startDate);
    }
    if (updatedData.endDate) {
        updatedData.endDate = new Date(updatedData.endDate);
    }

    // Validate dates (ensure endDate > startDate)
    if (updatedData.startDate && updatedData.endDate) {
        if (updatedData.endDate <= updatedData.startDate) {
            return res.status(400).json({
                message: "End date must be after start date.",
            });
        }
    }

    // Explicitly set updatedAt field to current date
    updatedData.updatedAt = new Date();

    try {
        const budget = await Budget.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true, // Still ensure other validations (like required fields) are enforced
        });

        if (!budget) {
            return res.status(404).json({ message: "Budget not found." });
        }

        res.status(200).json({ message: "Budget updated successfully.", budget });
    } catch (error) {
        console.error("Error updating budget:", error.message);
        res.status(400).json({ message: "Failed to update budget.", error: error.message });
    }
};


// Delete a budget by ID
const deleteABudget = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedBudget = await Budget.findByIdAndDelete(id);

        if (!deletedBudget) {
            return res.status(404).json({ message: 'Budget not found.' });
        }

        res.status(200).json({ message: 'Budget deleted successfully.', deletedBudget });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete budget.', error: error.message });
    }
};


module.exports = {
    postABudget,
    getAllBudgets,
    getASingleBudget,
    updateABudget,
    deleteABudget,
};