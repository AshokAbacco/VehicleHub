const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../logs/app.log');

const ensureLogDir = () => {
  const dir = path.dirname(logFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const logger = {
  info: (message) => {
    ensureLogDir();
    fs.appendFileSync(logFile, `[INFO] ${new Date().toISOString()} ${message}\n`);
  },
  error: (message) => {
    ensureLogDir();
    fs.appendFileSync(logFile, `[ERROR] ${new Date().toISOString()} ${message}\n`);
  },
};

module.exports = logger;
