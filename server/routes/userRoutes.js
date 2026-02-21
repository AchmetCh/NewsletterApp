const express = require('express');
const router = express.Router();
const { getUsers, createUser, deleteUser } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All user routes require authentication AND admin role
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/', getUsers);
router.post('/', createUser);
router.delete('/:id', deleteUser);

module.exports = router;
