const Budget = require("./budget.model");
const nodemailer = require("nodemailer");
const axios = require("axios"); // Use axios for token retrieval
require("dotenv").config();

// Function to get access token
const getAccessToken = async () => {
    try {
        const tokenUrl = `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}/oauth2/v2.0/token`;

        // Prepare form data for the token request
        const params = new URLSearchParams();
        params.append("client_id", process.env.OUTLOOK_CLIENT_ID);
        params.append("client_secret", process.env.OUTLOOK_CLIENT_SECRET);
        params.append("scope", "https://outlook.office365.com/.default");
        params.append("grant_type", "client_credentials");

        // Make the POST request to retrieve the access token
        const response = await axios.post(tokenUrl, params, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        return response.data.access_token;
    } catch (error) {
        console.error("❌ Error getting OAuth2 token:", error.response?.data || error.message);
        return null;
    }
};

// Create node transport
let transporter;

const createTransporter = async () => {
    try {
        const accessToken = await getAccessToken();
        if (!accessToken) throw new Error("No access token");

        transporter = nodemailer.createTransport({
            host: "smtp.office365.com",
            port: 587,
            secure: false, // Use TLS
            auth: {
                type: "OAuth2",
                user: process.env.EMAIL_USER,
                accessToken,
            },
            tls: {
                ciphers: "SSLv3",
            },
        });

        console.log("✅ Transporter initialized");
    } catch (error) {
        console.error("❌ Transporter creation failed:", error.message);
    }
};

// Function to send email
const sendBudgetCreationEmail = async (userEmail, budgetDetails) => {
    console.log("📩 Preparing to send email...");
    console.log("🛠️ Sending email to:", userEmail);
    console.log("📊 Email Details:", budgetDetails);

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
        console.log("📨 Attempting to send email...");
        
        // Ensure transporter is initialized before sending the email
        if (!transporter) {
            await createTransporter();
        }

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully:", info);
    } catch (error) {
        console.error("❌ Failed to send email:", error.message);
    }
};

// Create a new budget
const postABudget = async (req, res) => {
    try {
        const { name, amount, category, description, userEmail, userId, startDate, endDate } = req.body;

        // Check if userEmail is provided
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
