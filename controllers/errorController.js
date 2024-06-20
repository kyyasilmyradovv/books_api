const sendError = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
};

module.exports = (err, req, res, next) => {
    if (err.name === 'SequelizeUniqueConstraintError') {
        err.statusCode = 409;
        err.status = 'fail';
    } else {
        err.statusCode = err.statusCode || 500;
        err.status = err.status || 'error';
    }
    console.error(err);
    sendError(err, res);
};
