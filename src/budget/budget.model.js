const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    category: {
        type: String,
        required: true,
       
    },
    userId: {   // Add this field
        type: String,
        required: true,
       
    },
    userEmail: {
        type: String,
        required: true,
    }, // Add this field
    description: {
        type: String,
        trim: true,
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    endDate: {
        type: Date,
        required: true,
        // validate: {
        //     validator: function (value) {
        //         return value > this.startDate;
        //     },
        //     message: 'End date must be after start date.',
        // },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['Active', 'Archived'],
        default: 'Active',
    },
});

// Virtual field to calculate duration in days
budgetSchema.virtual('duration').get(function () {
    const diff = this.endDate - this.startDate;
    return Math.ceil(diff / (1000 * 60 * 60 * 24)); // Duration in days
});

module.exports = mongoose.model('Budget', budgetSchema);
