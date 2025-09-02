const { validationResult } = require('express-validator');
const Otp = require('../models/Otp');
const Client = require('../models/Client');

// @desc    Send OTP to client
// @access  Public
const sendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { clientId } = req.body;

    // Check if client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check if client has a phone number
    if (!client.phone) {
      return res.status(400).json({
        success: false,
        message: 'Client does not have a phone number'
      });
    }

    // Generate new OTP
    const otpCode = Otp.generateOTP();

    // Invalidate any existing OTPs for this client
    await Otp.updateMany(
      { client: clientId, isUsed: false },
      { isUsed: true }
    );

    // Create new OTP
    const otp = new Otp({
      client: clientId,
      otp: otpCode,
      phone: client.phone
    });

    await otp.save();

    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log(`OTP for client ${client.name} (${client.phone}): ${otpCode}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        clientId: client._id,
        clientName: client.name,
        phone: client.phone,
        expiresIn: '5 minutes'
      }
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Verify OTP
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { clientId, otp } = req.body;

    // Find the most recent valid OTP for this client
    const otpRecord = await Otp.findOne({
      client: clientId,
      otp: otp,
      isUsed: false
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if OTP is still valid
    if (!otpRecord.isValid()) {
      // Mark as used if expired or max attempts reached
      otpRecord.isUsed = true;
      await otpRecord.save();

      return res.status(400).json({
        success: false,
        message: 'OTP has expired or exceeded maximum attempts'
      });
    }

    // Increment attempts
    otpRecord.attempts += 1;

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      await otpRecord.save();
      
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
        attemptsLeft: 3 - otpRecord.attempts
      });
    }

    // OTP is valid - mark as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Get client details
    const client = await Client.findById(clientId);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        clientId: client._id,
        clientName: client.name,
        phone: client.phone,
        verifiedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Resend OTP to client
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { clientId } = req.body;

    // Check if client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check if client has a phone number
    if (!client.phone) {
      return res.status(400).json({
        success: false,
        message: 'Client does not have a phone number'
      });
    }

    // Check if there's an active OTP
    const existingOTP = await Otp.findOne({
      client: clientId,
      isUsed: false
    }).sort({ createdAt: -1 });

    if (existingOTP && existingOTP.isValid()) {
      // Check if enough time has passed since last OTP (minimum 30 seconds)
      const timeSinceLastOTP = new Date() - existingOTP.createdAt;
      const minInterval = 30 * 1000; // 30 seconds

      if (timeSinceLastOTP < minInterval) {
        const waitTime = Math.ceil((minInterval - timeSinceLastOTP) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitTime} seconds before requesting another OTP`
        });
      }
    }

    // Generate new OTP
    const otpCode = Otp.generateOTP();

    // Invalidate any existing OTPs for this client
    await Otp.updateMany(
      { client: clientId, isUsed: false },
      { isUsed: true }
    );

    // Create new OTP
    const otp = new Otp({
      client: clientId,
      otp: otpCode,
      phone: client.phone
    });

    await otp.save();

    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log(`Resent OTP for client ${client.name} (${client.phone}): ${otpCode}`);

    res.json({
      success: true,
      message: 'OTP resent successfully',
      data: {
        clientId: client._id,
        clientName: client.name,
        phone: client.phone,
        expiresIn: '5 minutes'
      }
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get OTP status for client
// @access  Public
const getOTPStatus = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Find the most recent OTP for this client
    const otpRecord = await Otp.findOne({
      client: clientId
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.json({
        success: true,
        data: {
          hasActiveOTP: false,
          message: 'No OTP found'
        }
      });
    }

    const isValid = otpRecord.isValid();
    const timeLeft = Math.max(0, Math.floor((otpRecord.expiresAt - new Date()) / 1000));

    res.json({
      success: true,
      data: {
        hasActiveOTP: isValid,
        isUsed: otpRecord.isUsed,
        attempts: otpRecord.attempts,
        timeLeft: timeLeft,
        expiresAt: otpRecord.expiresAt
      }
    });

  } catch (error) {
    console.error('Get OTP status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  resendOTP,
  getOTPStatus
};
