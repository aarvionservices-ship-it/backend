const { ROLE_PERMISSIONS } = require('../config/permissions');

// ... (other imports)

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // Get permissions based on role
        const userRole = user.role.replace('-', '_');
        const permissions = ROLE_PERMISSIONS[userRole] || [];

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions,
            token: generateToken(user._id)
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

// @desc    Get current user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and expiry (10 minutes)
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const message = `Your password reset OTP is ${otp}. It expires in 10 minutes.`;
    const html = `<h3>Password Reset Request</h3><p>Your OTP code is: <strong>${otp}</strong></p><p>It expires in 10 minutes.</p>`;

    try {
        await sendEmail(user.email, 'Password Reset OTP', message, html);
        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        res.status(500).json({ message: 'Email could not be sent' });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
        email,
        otp,
        otpExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Set new password
    user.password = newPassword;
    user.otp = undefined; // Clear OTP
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    resetPassword
};
