const express = require('express');
const Issue = require('../models/Issue');
const IssueUpdate = require('../models/IssueUpdate');
const User = require('../models/User');
const { auth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/analytics/dashboard
router.get('/dashboard', auth, requireAdmin, async (req, res) => {
    try {
        const [
            totalIssues,
            reportedCount,
            inProgressCount,
            resolvedCount,
            closedCount,
            categoryBreakdown,
            priorityBreakdown,
            recentIssues,
            totalStudents,
            monthlyTrend
        ] = await Promise.all([
            Issue.countDocuments(),
            Issue.countDocuments({ status: 'Reported' }),
            Issue.countDocuments({ status: 'In Progress' }),
            Issue.countDocuments({ status: 'Resolved' }),
            Issue.countDocuments({ status: 'Closed' }),
            Issue.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Issue.aggregate([
                { $group: { _id: '$priority', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Issue.find()
                .populate('reportedBy', 'name email')
                .sort({ createdAt: -1 })
                .limit(5),
            User.countDocuments({ role: 'student' }),
            Issue.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        count: { $sum: 1 },
                        resolved: {
                            $sum: { $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0] }
                        }
                    }
                },
                { $sort: { '_id.year': -1, '_id.month': -1 } },
                { $limit: 12 }
            ])
        ]);

        // Calculate average resolution time
        const resolvedIssues = await Issue.find({
            status: { $in: ['Resolved', 'Closed'] },
            resolvedAt: { $exists: true }
        }).select('createdAt resolvedAt');

        let avgResolutionHours = 0;
        if (resolvedIssues.length > 0) {
            const totalHours = resolvedIssues.reduce((sum, issue) => {
                const diff = (new Date(issue.resolvedAt) - new Date(issue.createdAt)) / (1000 * 60 * 60);
                return sum + diff;
            }, 0);
            avgResolutionHours = Math.round(totalHours / resolvedIssues.length);
        }

        // Format monthly trend
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedTrend = monthlyTrend.map(item => ({
            month: `${months[item._id.month - 1]} ${item._id.year}`,
            reported: item.count,
            resolved: item.resolved
        })).reverse();

        res.json({
            overview: {
                totalIssues,
                reported: reportedCount,
                inProgress: inProgressCount,
                resolved: resolvedCount,
                closed: closedCount,
                totalStudents,
                avgResolutionHours
            },
            categoryBreakdown: categoryBreakdown.map(c => ({ name: c._id, value: c.count })),
            priorityBreakdown: priorityBreakdown.map(p => ({ name: p._id, value: p.count })),
            monthlyTrend: formattedTrend,
            recentIssues
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

module.exports = router;
