const router = require('express').Router();
const { protect } = require('../middleware/auth');
const syncCtrl = require('../controllers/syncController');

router.post('/flush', protect, syncCtrl.flushQueue);
router.get('/pull', protect, syncCtrl.pullUpdates);

module.exports = router;

