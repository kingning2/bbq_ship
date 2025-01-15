import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize } = winston.format;

// 自定义日志格式
const logFormat = printf(({ level, message, timestamp, context, trace }) => {
  return `${timestamp} [${context}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
});

// 创建日志配置
export const loggerConfig = {
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        nestWinstonModuleUtilities.format.nestLike('BBQ Order System', {
          prettyPrint: true,
          colors: true,
        }),
      ),
    }),
    // 信息日志文件
    new winston.transports.DailyRotateFile({
      dirname: 'logs',
      filename: 'info-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
      format: combine(winston.format.uncolorize(), logFormat),
    }),
    // 错误日志文件
    new winston.transports.DailyRotateFile({
      dirname: 'logs',
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
      format: combine(
        winston.format.uncolorize(),
        winston.format.errors({ stack: true }),
        logFormat,
      ),
    }),
  ],
};
