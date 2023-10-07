require("dotenv").config();
const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");

// DB environment variables
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

// Upload files directly to AWS
const uploadFiles = (filepath) => {
  return s3
    .upload({
      Bucket: bucketName,
      Body: fs.createReadStream(filepath.path),
      Key: filepath.filename,
    })
    .promise();
};

// Download files directly from AWS
const getFiles = (filename) => {
  return s3
    .getObject({
      Key: filename,
      Bucket: bucketName,
    })
    .createReadStream();
};

module.exports = {
  uploadFiles,
  getFiles,
};
