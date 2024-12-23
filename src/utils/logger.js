const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file'); // Hỗ trợ chia log theo ngày

const env = process.env.NODE_ENV || 'development';

const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)
);

const logger = createLogger({
    level: env === 'development' ? 'debug' : 'info', // Log mức độ chi tiết khi phát triển
    format: logFormat,
    transports: [
        new transports.Console({ silent: env === 'production' }), // Không ghi log console trong production
        new transports.DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d' // Giữ log 14 ngày
        }),
        new transports.File({ filename: 'logs/error.log', level: 'error' }) // Ghi log lỗi
    ]
});

module.exports = logger;
