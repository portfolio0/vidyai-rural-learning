const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/progressController');

router.get('/',                    protect, ctrl.getProgress);
router.get('/:studentId',          protect, ctrl.getProgress);
router.post('/update',             protect, ctrl.updateProgress);
router.get('/leaderboard/class',   protect, ctrl.getLeaderboard);
router.post('/xp',                 protect, ctrl.addXP);
module.exports = router;
