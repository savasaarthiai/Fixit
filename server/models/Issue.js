const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const issueSchema = new mongoose.Schema({
    issueId: {
        type: String,
        unique: true,
        index: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: 5,
        maxlength: 200
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: 10,
        maxlength: 2000
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Water/Leakage', 'Garbage', 'Washroom', 'Classroom', 'Corridor', 'Electrical', 'Furniture', 'Other']
    },
    priority: {
        type: String,
        required: [true, 'Priority is required'],
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Reported', 'In Progress', 'Resolved', 'Closed'],
        default: 'Reported'
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        },
        building: { type: String, trim: true },
        floor: { type: String, trim: true },
        room: { type: String, trim: true }
    },
    photos: [{
        type: String
    }],
    resolutionPhoto: {
        type: String,
        default: ''
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: {
        type: Date
    }
}, {
    timestamps: true
});

issueSchema.index({ location: '2dsphere' });

issueSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findByIdAndUpdate(
                'issueId',
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.issueId = `FIX-${String(counter.seq).padStart(4, '0')}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

module.exports = mongoose.model('Issue', issueSchema);
