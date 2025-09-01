const express = require('express');
const { body, validationResult } = require('express-validator');
const { adminAuth, salesmanAuth } = require('../middleware/auth');
const Client = require('../models/Client');
const Area = require('../models/Area');

const router = express.Router();

// @route   POST /api/clients
// @desc    Create new client
// @access  Private (Admin only)
router.post('/', [
  adminAuth,
  body('name').notEmpty().withMessage('Client name is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('area').notEmpty().withMessage('Area is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('company').optional().trim(),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('status').optional().isIn(['active', 'inactive', 'prospect', 'customer']).withMessage('Invalid status'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, company, email, phone, address, area, status, notes, assignedSalesman } = req.body;

    // Check if area exists
    const areaExists = await Area.findById(area);
    if (!areaExists) {
      return res.status(400).json({ message: 'Area not found' });
    }

    // Check if assigned salesman exists and is active
    if (assignedSalesman) {
      const salesmanExists = await User.findById(assignedSalesman);
      if (!salesmanExists || salesmanExists.role !== 'salesman' || !salesmanExists.isActive) {
        return res.status(400).json({ message: 'Invalid salesman assignment' });
      }
    }

    const client = new Client({
      name,
      company,
      email,
      phone,
      address,
      area,
      status,
      notes,
      assignedSalesman
    });

    await client.save();

    const clientResponse = await Client.findById(client._id)
      .populate('area', 'name city state')
      .populate('assignedSalesman', 'firstName lastName');

    res.status(201).json(clientResponse);
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/clients
// @desc    Get all clients (admin) or area-specific clients (salesman)
// @access  Private
router.get('/', [adminAuth, salesmanAuth], async (req, res) => {
  try {
    const { area, status, search, page = 1, limit = 20 } = req.query;
    
    let query = { isActive: true };
    
    // If salesman, only show clients from their area
    if (req.user.role === 'salesman') {
      query.area = req.user.area;
    } else if (area) {
      query.area = area;
    }
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const clients = await Client.find(query)
      .populate('area', 'name city state')
      .populate('assignedSalesman', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Client.countDocuments(query);

    res.json({
      clients,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/clients/:id
// @desc    Get client by ID
// @access  Private
router.get('/:id', [adminAuth, salesmanAuth], async (req, res) => {
  try {
    const { id } = req.params;
    
    let query = { _id: id, isActive: true };
    
    // If salesman, only show clients from their area
    if (req.user.role === 'salesman') {
      query.area = req.user.area;
    }

    const client = await Client.findOne(query)
      .populate('area', 'name city state')
      .populate('assignedSalesman', 'firstName lastName');

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private (Admin only)
router.put('/:id', [
  adminAuth,
  body('name').optional().notEmpty().withMessage('Client name cannot be empty'),
  body('phone').optional().notEmpty().withMessage('Phone number cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('status').optional().isIn(['active', 'inactive', 'prospect', 'customer']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if area exists if updating area
    if (updateData.area) {
      const areaExists = await Area.findById(updateData.area);
      if (!areaExists) {
        return res.status(400).json({ message: 'Area not found' });
      }
    }

    // Check if assigned salesman exists and is active
    if (updateData.assignedSalesman) {
      const salesmanExists = await User.findById(updateData.assignedSalesman);
      if (!salesmanExists || salesmanExists.role !== 'salesman' || !salesmanExists.isActive) {
        return res.status(400).json({ message: 'Invalid salesman assignment' });
      }
    }

    const client = await Client.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('area', 'name city state')
     .populate('assignedSalesman', 'firstName lastName');

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/clients/:id
// @desc    Delete client (soft delete)
// @access  Private (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await Client.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({ message: 'Client deactivated successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/clients/:id/assign-salesman
// @desc    Assign salesman to client
// @access  Private (Admin only)
router.post('/:id/assign-salesman', [
  adminAuth,
  body('salesmanId').notEmpty().withMessage('Salesman ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { salesmanId } = req.body;

    // Check if salesman exists and is active
    const salesman = await User.findById(salesmanId);
    if (!salesman || salesman.role !== 'salesman' || !salesman.isActive) {
      return res.status(400).json({ message: 'Invalid salesman' });
    }

    const client = await Client.findByIdAndUpdate(
      id,
      { assignedSalesman: salesmanId },
      { new: true }
    ).populate('area', 'name city state')
     .populate('assignedSalesman', 'firstName lastName');

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error('Assign salesman error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
