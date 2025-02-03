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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; background: #f9f9f9; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #4CAF50; text-align: center;">🎯 New Budget Created</h1>
        <p style="font-size: 16px; color: #333;">Here are the details of your new budget:</p>
        
        <table style="width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden;">
            <tr style="background: #4CAF50; color: #fff;">
                <th style="padding: 10px; text-align: left;">Detail</th>
                <th style="padding: 10px; text-align: left;">Value</th>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${budgetDetails.name}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Amount:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">$${budgetDetails.amount}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Category:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${budgetDetails.category}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Description:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${budgetDetails.description || "N/A"}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Start Date:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${budgetDetails.startDate?.toDateString()}</td>
            </tr>
            <tr>
                <td style="padding: 10px;"><strong>End Date:</strong></td>
                <td style="padding: 10px;">${budgetDetails.endDate?.toDateString()}</td>
            </tr>
        </table>

        <p style="font-size: 16px; color: #333; text-align: center; margin-top: 20px;">
            Thank you for using <strong style="color: #4CAF50;">Sparynx BudgetTracker</strong>! 🚀
        </p>

        <div style="text-align: center; margin-top: 20px;">
            <a href="https://sparynxbudgetapp.vercel.app" style="display: inline-block; padding: 12px 20px; font-size: 16px; color: #fff; background: #4CAF50; text-decoration: none; border-radius: 5px;">Manage Your Budget</a>
        </div>
    </div>
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



const sendBudgetDeadlineReminder = async (userEmail, budgetDetails) => {
    console.log("⏳ Sending budget deadline reminder...");

    const sentFrom = new Sender(process.env.EMAIL_SENDER, "Sparynx BudgetTracker");
    const recipients = [new Recipient(userEmail)];

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; background: #fffbe6; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #d9534f; text-align: center;">⏳ Budget Deadline Approaching</h1>
            <p style="font-size: 16px; color: #333;">Your budget is about to end in <strong>24 hours</strong>.</p>

            <table style="width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden;">
                <tr style="background: #d9534f; color: #fff;">
                    <th style="padding: 10px; text-align: left;">Detail</th>
                    <th style="padding: 10px; text-align: left;">Value</th>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${budgetDetails.name}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>End Date:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${budgetDetails.endDate?.toDateString()}</td>
                </tr>
            </table>

            <p style="font-size: 16px; color: #333; text-align: center; margin-top: 20px;">
                Please review your budget before it expires.
            </p>

            <div style="text-align: center; margin-top: 20px;">
                <a href="https://sparynxbudgetapp.vercel.app" style="display: inline-block; padding: 12px 20px; font-size: 16px; color: #fff; background: #d9534f; text-decoration: none; border-radius: 5px;">Manage Your Budget</a>
            </div>
        </div>
    `;

    try {
        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setSubject("⏳ Budget Deadline Reminder")
            .setHtml(htmlContent);

        await mailerSend.email.send(emailParams);
        console.log("✅ Reminder email sent successfully!");
    } catch (error) {
        console.error("❌ Failed to send reminder email:", error.message);
    }
};


// Create a new budget
const postABudget = async (req, res) => {
    try {
        const { name, amount, category, description, userEmail, userId, startDate, endDate } = req.body;

        if (!userEmail) {
            return res.status(400).json({ message: 'User email is required.' });
        }

        if (!name || !amount || !category || !description || !startDate || !endDate || !userEmail) {
            return res.status(400).json({ message: 'All required fields must be provided.' });
        }

        const budget = new Budget({
            name,
            amount,
            category,
            description,
            userId,
            userEmail,
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
            userEmail: budget.userEmail,
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

// Function to send budget deletion confirmation email
const sendDeletionConfirmationEmail = async (userEmail, budgetDetails) => {
    console.log("📩 Preparing to send deletion confirmation email...");
    console.log("🛠️ Sending email to:", userEmail);
    console.log("📊 Email Details:", budgetDetails);

    const sentFrom = new Sender(process.env.EMAIL_SENDER, "Sparynx BudgetTracker");
    const recipients = [new Recipient(userEmail)];

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; background: #f9f9f9; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #d9534f; text-align: center;">🗑️ Budget Deleted</h1>
        <p style="font-size: 16px; color: #333;">The following budget has been deleted from your account:</p>
        
        <table style="width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden;">
            <tr style="background: #d9534f; color: #fff;">
                <th style="padding: 10px; text-align: left;">Detail</th>
                <th style="padding: 10px; text-align: left;">Value</th>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${budgetDetails.name}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Amount:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">$${budgetDetails.amount}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Category:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${budgetDetails.category}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Description:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${budgetDetails.description || "N/A"}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Start Date:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${budgetDetails.startDate?.toDateString()}</td>
            </tr>
            <tr>
                <td style="padding: 10px;"><strong>End Date:</strong></td>
                <td style="padding: 10px;">${budgetDetails.endDate?.toDateString()}</td>
            </tr>
        </table>

        <p style="font-size: 16px; color: #333; text-align: center; margin-top: 20px;">
            Thank you for using <strong style="color: #d9534f;">Sparynx BudgetTracker</strong>! 🚀
        </p>

        <div style="text-align: center; margin-top: 20px;">
            <a href="https://sparynxbudgetapp.vercel.app" style="display: inline-block; padding: 12px 20px; font-size: 16px; color: #fff; background: #d9534f; text-decoration: none; border-radius: 5px;">Manage Your Budget</a>
        </div>
    </div>
`;

    try {
        console.log("📨 Attempting to send email...");

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setSubject("Budget Deleted")
            .setHtml(htmlContent);

        await mailerSend.email.send(emailParams);
        console.log("✅ Email sent successfully!");
    } catch (error) {
        console.error("❌ Failed to send email:", error.message);
    }
};

const deleteABudget = async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedBudget = await Budget.findByIdAndDelete(id);
  
      if (!deletedBudget) {
        return res.status(404).json({ message: "Budget not found." });
      }
  
      // Ensure userEmail is available in the deleted budget
      const userEmail = deletedBudget.userEmail;
  
      if (!userEmail) {
        console.error("❌ User email not found in the deleted budget.");
        return res.status(400).json({ message: "User email not found in the deleted budget." });
      }
  
      // Send email notification about successful budget deletion
      const budgetDetails = {
        name: deletedBudget.name,
        amount: deletedBudget.amount,
        category: deletedBudget.category,
        description: deletedBudget.description,
        startDate: deletedBudget.startDate,
        endDate: deletedBudget.endDate,
      };
  
      await sendDeletionConfirmationEmail(userEmail, budgetDetails);
  
      res.status(200).json({ message: "Budget deleted successfully.", deletedBudget });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete budget.", error: error.message });
    }
  };



module.exports = {
    postABudget,
    getAllBudgets,
    getASingleBudget,
    updateABudget,
    deleteABudget,
    sendBudgetDeadlineReminder
};
