const mongoose = require('mongoose');

const issueUpdateSchema = new mongoose.Schema({
    issue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fromStatus: {
        type: String,
        enum: ['Reported', 'In Progress', 'Resolved', 'Closed']
    },
    toStatus: {
        type: String,
        enum: ['Reported', 'In Progress', 'Resolved', 'Closed']
    },
    note: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    photo: {
        type: String
    }
}, {
    timestamps: true
});

issueUpdateSchema.index({ issue: 1, createdAt: 1 });

module.exports = mongoose.model('IssueUpdate', issueUpdateSchema);
