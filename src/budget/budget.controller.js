const Budget = require("./budget.model");
const { MailerSend, EmailParams, Recipient, Sender } = require("mailersend");
require("dotenv").config();

// Initialize MailerSend
const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY,
});

// Function to send email notification
const sendBudgetCreationEmail = async (userEmail, budgetDetails) => {
    console.log("📩 Preparing to send email...");
    console.log("🛠️ Sending email to:", userEmail);
    console.log("📊 Email Details:", budgetDetails);

    const sentFrom = new Sender(process.env.EMAIL_SENDER, "Sparynx BudgetTracker");
    const recipients = [new Recipient(userEmail)];

    const htmlContent = `
        <h1>New Budget Created</h1>
        <p>Here are the details of your new budget:</p>
        <ul>
            <li><strong>Name:</strong> ${budgetDetails.name}</li>
            <li><strong>Amount:</strong> $${budgetDetails.amount}</li>
            <li><strong>Category:</strong> ${budgetDetails.category}</li>
            <li><strong>Description:</strong> ${budgetDetails.description || "N/A"}</li>
            <li><strong>Start Date:</strong> ${budgetDetails.startDate?.toDateString()}</li>
            <li><strong>End Date:</strong> ${budgetDetails.endDate?.toDateString()}</li>
        </ul>
        <p>Thank you for using Sparynx BudgetTracker!</p>
    `;

    try {
        console.log("📨 Attempting to send email...");

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setSubject("New Budget Created")
            .setHtml(htmlContent);

        await mailerSend.email.send(emailParams);
        console.log("✅ Email sent successfully!");
    } catch (error) {
        console.error("❌ Failed to send email:", error.message);
    }
};

// Create a new budget
const postABudget = async (req, res) => {
    try {
        const { name, amount, category, description, userEmail, userId, startDate, endDate } = req.body;

        if (!userEmail) {
            return res.status(400).json({ message: 'User email is required.' });
        }

        if (!name || !amount || !category || !startDate || !endDate) {
            return res.status(400).json({ message: 'All required fields must be provided.' });
        }

        const budget = new Budget({
            name,
            amount,
            category,
            description,
            userId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
        });

        await budget.save();

        const budgetDetails = {
            name: budget.name,
            amount: budget.amount,
            category: budget.category,
            description: budget.description,
            startDate: budget.startDate,
            endDate: budget.endDate,
        };

        await sendBudgetCreationEmail(userEmail, budgetDetails);

        res.status(201).json({ message: 'Budget created successfully.', budget });
    } catch (error) {
        console.error("❌ Error creating budget:", error.message);
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

    if (updatedData.startDate) {
        updatedData.startDate = new Date(updatedData.startDate);
    }

    if (updatedData.endDate) {
        updatedData.endDate = new Date(updatedData.endDate);
    }

    if (updatedData.startDate && updatedData.endDate) {
        if (updatedData.endDate <= updatedData.startDate) {
            return res.status(400).json({
                message: "End date must be after start date.",
            });
        }
    }

    updatedData.updatedAt = new Date();

    try {
        const budget = await Budget.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true,
        });

        if (!budget) {
            return res.status(404).json({ message: "Budget not found." });
        }

        res.status(200).json({ message: "Budget updated successfully.", budget });
    } catch (error) {
        console.error("Error updating budget:", error.message);
        res.status(500).json({
            message: "Failed to update budget.",
            error: error.message
        });
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
