import express from 'express';
import {
  register,
  login,
  getAllUsers,
  getProfile,
  updateUser,
  deleteUser
} from '../controllers/demoUserController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/', getAllUsers);
router.get('/:id', getProfile);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
