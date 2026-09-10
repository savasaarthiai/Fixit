const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    issue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue'
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['status_update', 'assignment', 'resolution', 'new_report'],
        default: 'status_update'
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
