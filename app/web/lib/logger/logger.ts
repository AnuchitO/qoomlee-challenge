export interface LogMeta {
  [key: string]: unknown;
}

export interface Logger {
  info(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  error(message: string, meta?: LogMeta): void;
}

function log(write: (message: string, meta?: LogMeta) => void, message: string, meta?: LogMeta) {
  if (meta) {
    write(message, meta);
  } else {
    write(message);
  }
}

export const logger: Logger = {
  info(message, meta) {
    log(console.log, message, meta);
  },
  warn(message, meta) {
    log(console.warn, message, meta);
  },
  error(message, meta) {
    log(console.error, message, meta);
  },
};
