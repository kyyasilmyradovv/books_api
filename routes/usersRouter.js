const express = require('express');
const {
  login,
  refreshToken,
  getMyProfile,
  protect,
  signup,
  verify,
  updateMyProfile,
} = require('../controllers/authController');
const { checkInputs } = require('../utils/input/checkInputs');
const {
  editUser,
  getUser,
  getAllUsers,
} = require('../controllers/userControllers');
const router = express.Router();

// Authentication routes
router.post('/login', login);
router.post('/signup', checkInputs('user', 'create'), signup);
router.post('/verify', verify);

// Refresh token
router.use('/', protect);
router.post('/refresh-token', refreshToken);

// Profile routes
router.get('/profile', getMyProfile);
router.patch('/profile', updateMyProfile);

// // Admins routes
router.get('/', getAllUsers);
router.get('/:id', getUser);
router.put('/:id', editUser);

module.exports = router;
