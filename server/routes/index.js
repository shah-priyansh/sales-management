const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const salesmenRoutes = require('./salesmen');
const clientsRoutes = require('./clients');
const areasRoutes = require('./areas');

const v1Routes = (app) => {
    app.use('/v1/auth', authRoutes);
    app.use('/v1/admin', adminRoutes);
    app.use('/v1/salesmen', salesmenRoutes);
    app.use('/v1/clients', clientsRoutes);
    app.use('/v1/areas', areasRoutes);
};

module.exports = v1Routes;
