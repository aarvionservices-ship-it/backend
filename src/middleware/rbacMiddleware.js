const { ROLES, ROLE_PERMISSIONS } = require('../config/permissions');

/**
 * Middleware to check if the user has one of the required roles.
 * Assumes req.user is already populated by authMiddleware.
 */
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Access denied: No role assigned' });
        }

        // Normalize role (handle super-admin vs super_admin if needed)
        const userRole = req.user.role.replace('-', '_');

        if (allowedRoles.includes(userRole)) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied: Insufficient privileges' });
        }
    };
};

/**
 * Middleware to check if the user has a specific permission.
 */
const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Access denied: No role assigned' });
        }

        const userRole = req.user.role.replace('-', '_');
        const userPermissions = ROLE_PERMISSIONS[userRole] || [];

        if (userPermissions.includes(permission)) {
            next();
        } else {
            res.status(403).json({ message: `Access denied: Missing permission '${permission}'` });
        }
    };
};

module.exports = { checkRole, checkPermission };
