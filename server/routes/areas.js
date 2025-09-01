const express = require('express');
const { body, validationResult } = require('express-validator');
const { adminAuth } = require('../middleware/auth');
const Area = require('../models/Area');

const router = express.Router();

// @route   POST /api/areas
// @desc    Create new area
// @access  Private (Admin only)
router.post('/', [
  adminAuth,
  body('name').notEmpty().withMessage('Area name is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('description').optional().trim(),
  body('coordinates.latitude').optional().isFloat().withMessage('Latitude must be a number'),
  body('coordinates.longitude').optional().isFloat().withMessage('Longitude must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, city, state, description, coordinates } = req.body;

    // Check if area already exists
    const existingArea = await Area.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      city: { $regex: new RegExp(`^${city}$`, 'i') },
      state: { $regex: new RegExp(`^${state}$`, 'i') }
    });

    if (existingArea) {
      return res.status(400).json({ message: 'Area already exists in this city and state' });
    }

    const area = new Area({
      name,
      city,
      state,
      description,
      coordinates
    });

    await area.save();
    res.status(201).json(area);
  } catch (error) {
    console.error('Create area error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/areas
// @desc    Get all areas
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, state, search, page = 1, limit = 20 } = req.query;
    
    let query = { isActive: true };
    
    if (city) query.city = { $regex: city, $options: 'i' };
    if (state) query.state = { $regex: state, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } }
      ];
    }

    const areas = await Area.find(query)
      .sort({ name: 1, city: 1, state: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Area.countDocuments(query);

    res.json({
      areas,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get areas error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/areas/:id
// @desc    Get area by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const area = await Area.findById(req.params.id);
    
    if (!area) {
      return res.status(404).json({ message: 'Area not found' });
    }

    res.json(area);
  } catch (error) {
    console.error('Get area error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/areas/:id
// @desc    Update area
// @access  Private (Admin only)
router.put('/:id', [
  adminAuth,
  body('name').optional().notEmpty().withMessage('Area name cannot be empty'),
  body('city').optional().notEmpty().withMessage('City cannot be empty'),
  body('state').optional().notEmpty().withMessage('State cannot be empty'),
  body('description').optional().trim(),
  body('coordinates.latitude').optional().isFloat().withMessage('Latitude must be a number'),
  body('coordinates.longitude').optional().isFloat().withMessage('Longitude must be a number'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if area already exists with same name in same city/state
    if (updateData.name || updateData.city || updateData.state) {
      const existingArea = await Area.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${updateData.name || ''}$`, 'i') },
        city: { $regex: new RegExp(`^${updateData.city || ''}$`, 'i') },
        state: { $regex: new RegExp(`^${updateData.state || ''}$`, 'i') }
      });

      if (existingArea) {
        return res.status(400).json({ message: 'Area already exists in this city and state' });
      }
    }

    const area = await Area.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!area) {
      return res.status(404).json({ message: 'Area not found' });
    }

    res.json(area);
  } catch (error) {
    console.error('Update area error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/areas/:id
// @desc    Delete area (soft delete)
// @access  Private (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const area = await Area.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!area) {
      return res.status(404).json({ message: 'Area not found' });
    }

    res.json({ message: 'Area deactivated successfully' });
  } catch (error) {
    console.error('Delete area error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
