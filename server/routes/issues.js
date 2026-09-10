const express = require('express');
const { body, validationResult, query } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Issue = require('../models/Issue');
const IssueUpdate = require('../models/IssueUpdate');
const Notification = require('../models/Notification');
const { auth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// POST /api/issues — Create a new issue
router.post('/', auth, upload.array('photos', 5), [
    body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
    body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
    body('category').isIn(['Water/Leakage', 'Garbage', 'Washroom', 'Classroom', 'Corridor', 'Electrical', 'Furniture', 'Other']),
    body('priority').isIn(['Low', 'Medium', 'High', 'Critical'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, category, priority, building, floor, room, latitude, longitude } = req.body;

        const photos = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

        const issue = new Issue({
            title,
            description,
            category,
            priority,
            status: 'Reported',
            location: {
                type: 'Point',
                coordinates: [
                    parseFloat(longitude) || 0,
                    parseFloat(latitude) || 0
                ],
                building: building || '',
                floor: floor || '',
                room: room || ''
            },
            photos,
            reportedBy: req.user._id
        });

        await issue.save();

        // Create initial update record
        await IssueUpdate.create({
            issue: issue._id,
            updatedBy: req.user._id,
            toStatus: 'Reported',
            note: 'Issue reported'
        });

        // Notify all admins
        const User = require('../models/User');
        const admins = await User.find({ role: 'admin' });
        const notifications = admins.map(admin => ({
            user: admin._id,
            issue: issue._id,
            message: `New issue reported: ${issue.issueId} — ${title}`,
            type: 'new_report'
        }));
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(201).json({
            message: 'Issue reported successfully',
            issue: {
                ...issue.toObject(),
                reportedBy: req.user.toJSON()
            }
        });
    } catch (error) {
        console.error('Create issue error:', error);
        res.status(500).json({ error: 'Failed to create issue' });
    }
});

// GET /api/issues — List issues
router.get('/', auth, async (req, res) => {
    try {
        const { status, category, priority, search, page = 1, limit = 20 } = req.query;

        const filter = {};

        // Students see only their issues, admins see all
        if (req.user.role !== 'admin') {
            filter.reportedBy = req.user._id;
        }

        if (status) filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { issueId: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [issues, total] = await Promise.all([
            Issue.find(filter)
                .populate('reportedBy', 'name email studentId department')
                .populate('assignedTo', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Issue.countDocuments(filter)
        ]);

        res.json({
            issues,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('List issues error:', error);
        res.status(500).json({ error: 'Failed to fetch issues' });
    }
});

// GET /api/issues/:id — Get issue detail
router.get('/:id', auth, async (req, res) => {
    try {
        const issue = await Issue.findOne({
            $or: [
                { _id: req.params.id },
                { issueId: req.params.id.toUpperCase() }
            ]
        })
            .populate('reportedBy', 'name email studentId department')
            .populate('assignedTo', 'name email');

        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        // Students can only see their own issues
        if (req.user.role !== 'admin' && issue.reportedBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const updates = await IssueUpdate.find({ issue: issue._id })
            .populate('updatedBy', 'name email role')
            .sort({ createdAt: 1 });

        res.json({ issue, updates });
    } catch (error) {
        console.error('Get issue error:', error);
        res.status(500).json({ error: 'Failed to fetch issue' });
    }
});

// PUT /api/issues/:id/status — Admin: Change status
router.put('/:id/status', auth, requireAdmin, upload.single('photo'), async (req, res) => {
    try {
        const { status, note } = req.body;

        if (!status || !['Reported', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const issue = await Issue.findOne({
            $or: [
                { _id: req.params.id },
                { issueId: req.params.id.toUpperCase() }
            ]
        });

        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        const fromStatus = issue.status;
        issue.status = status;

        if (status === 'Resolved') {
            issue.resolvedAt = new Date();
            if (req.file) {
                issue.resolutionPhoto = `/uploads/${req.file.filename}`;
            }
        }

        if (req.file && status !== 'Resolved') {
            issue.photos.push(`/uploads/${req.file.filename}`);
        }

        await issue.save();

        // Create update record
        const updateData = {
            issue: issue._id,
            updatedBy: req.user._id,
            fromStatus,
            toStatus: status,
            note: note || ''
        };
        if (req.file) {
            updateData.photo = `/uploads/${req.file.filename}`;
        }
        const issueUpdate = await IssueUpdate.create(updateData);

        // Notify the student
        await Notification.create({
            user: issue.reportedBy,
            issue: issue._id,
            message: `Your issue ${issue.issueId} status changed: ${fromStatus} → ${status}${note ? '. Note: ' + note : ''}`,
            type: status === 'Resolved' ? 'resolution' : 'status_update'
        });

        const populatedIssue = await Issue.findById(issue._id)
            .populate('reportedBy', 'name email studentId department')
            .populate('assignedTo', 'name email');

        res.json({
            message: 'Status updated successfully',
            issue: populatedIssue,
            update: issueUpdate
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

module.exports = router;
