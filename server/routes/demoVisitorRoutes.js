import express from 'express';
import {
  getAllVisitors,
  getVisitor,
  createVisitor,
  updateVisitor,
  deleteVisitor,
  getVisitorsByStatus,
  getVisitorsByDateRange,
} from '../controllers/demoVisitorController.js';

const router = express.Router();

// GET all visitors
router.get('/', getAllVisitors);

// GET visitors by status
router.get('/status/:status', getVisitorsByStatus);

// GET visitors by date range
router.get('/date-range', getVisitorsByDateRange);

// GET single visitor
router.get('/:id', getVisitor);

// CREATE visitor
router.post('/', createVisitor);

// UPDATE visitor
router.put('/:id', updateVisitor);

// DELETE visitor
router.delete('/:id', deleteVisitor);

export default router;
