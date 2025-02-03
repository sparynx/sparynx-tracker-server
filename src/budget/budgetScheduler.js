const cron = require("node-cron");
const Budget = require("./budget.model");
const { sendBudgetDeadlineReminder } = require("./budget.controller");

cron.schedule("0 * * * *", async () => { // Runs every hour
    console.log("🔎 Checking for budgets ending in 24 hours...");

    const now = new Date();
    const reminderTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours ahead

    try {
        const expiringBudgets = await Budget.find({
            endDate: {
                $gte: reminderTime.setHours(0, 0, 0, 0),
                $lt: reminderTime.setHours(23, 59, 59, 999),
            },
        });

        for (const budget of expiringBudgets) {
            await sendBudgetDeadlineReminder(budget.userEmail, budget);
        }

        console.log(`✅ Sent ${expiringBudgets.length} reminder emails.`);
    } catch (error) {
        console.error("❌ Error checking budgets:", error.message);
    }
});
