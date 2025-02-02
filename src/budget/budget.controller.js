const Budget = require("./budget.model");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,  // Outlook SMTP
    port: process.env.SMTP_PORT,  // 587 for TLS
    secure: false,  // Use TLS, not SSL
    auth: {
        user: process.env.EMAIL_USER,  // Your Outlook email
        pass: process.env.EMAIL_PASSWORD,  // Your Outlook password
    },
    tls: {
        ciphers: "SSLv3",  // Ensures compatibility
    },
});



  // Function to send email notification
  const sendBudgetCreationEmail = async (userEmail, budgetDetails) => {
    console.log("📩 Debug: Preparing email for →", userEmail);

    const mailOptions = {
        from: `"Sparynx BudgetTracker" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "New Budget Created",
        html: `
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
        `,
    };

    try {
        console.log("📨 Debug: Sending email...");
        await transporter.sendMail(mailOptions);
        console.log("✅ Debug: Email sent successfully.");
    } catch (error) {
        console.error("❌ Debug: Failed to send email:", error.message);
    }
};
  

// Create a new budget
const postABudget = async (req, res) => {
    try {
        const { name, amount, category, description, userEmail, userId, startDate, endDate } = req.body;

        if (!name || !amount || !category || !startDate || !endDate) {
            return res.status(400).json({ message: 'All required fields must be provided.' });
        }

        const budget = new Budget({ name, amount, category, description, userId, startDate: new Date(startDate), endDate: new Date(endDate), });
        await budget.save();


                // Create budgetDetails object explicitly
                const budgetDetails = {
                    name: budget.name,
                    amount: budget.amount,
                    category: budget.category,
                    description: budget.description,
                    startDate: budget.startDate,
                    endDate: budget.endDate,
                };
        
                // Call the email function with correctly formatted data
                await sendBudgetCreationEmail(userEmail, budgetDetails);
        

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