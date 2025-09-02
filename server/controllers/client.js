const { validationResult } = require('express-validator');
const Client = require('../models/Client');
const Area = require('../models/Area');
const User = require('../models/User');

// @desc    Create new client
// @access  Private (Admin only)
const createClient = async (req, res) => {
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
};

// @desc    Get all clients (admin) or area-specific clients (salesman)
// @access  Private
const getClients = async (req, res) => {
  try {
    const { area, status, search, page = 1, limit = 20 } = req.query;
    
    let query = { isActive: true };
    
    // If salesman, only show clients from their area
    if (req.user?.role === 'salesman') {
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
};

// @desc    Get client by ID
// @access  Private
const getClientById = async (req, res) => {
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
};

// @desc    Update client
// @access  Private (Admin only)
const updateClient = async (req, res) => {
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
};

// @desc    Delete client (soft delete)
// @access  Private (Admin only)
const deleteClient = async (req, res) => {
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
};

// @desc    Assign salesman to client
// @access  Private (Admin only)
const assignSalesman = async (req, res) => {
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
};

// @desc    Toggle client status (active/inactive)
// @access  Private (Admin only)
const toggleClientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Toggling status for client ID:', id);

    const client = await Client.findById(id);

    if (!client) {
      console.log('Client not found with ID:', id);
      return res.status(404).json({ message: 'Client not found' });
    }

    const previousStatus = client.isActive;
    client.isActive = !client.isActive;
    await client.save();

    console.log(`Client ${client.name} status changed from ${previousStatus} to ${client.isActive}`);

    res.json({
      message: `Client ${client.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        _id: client._id,
        isActive: client.isActive,
        name: client.name
      }
    });
  } catch (error) {
    console.error('Toggle client status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  assignSalesman,
  toggleClientStatus
};
