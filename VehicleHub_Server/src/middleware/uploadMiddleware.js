import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB per file
});

export const uploadArray = (fieldName, maxCount = 10) =>
  upload.array(fieldName, maxCount);

// New: handle multiple named file fields in one request (images[] + rcFront + insuranceDocument)
export const uploadFields = (fieldsConfig) => upload.fields(fieldsConfig);

export const uploadSingle = (fieldName) => upload.single(fieldName);
