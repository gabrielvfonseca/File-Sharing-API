require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const archiver = require("archiver");
const multer = require("multer");
const moment = require("moment");
const util = require("util");
const fs = require("fs");

// Defaul Variables
const MAX_DAYS = 7;
const MIN_DAYS = 2;

// Express Routing
const express = require("express");
const router = express.Router();

// Multer Config
const multerConfig = require("../config/multer");

// MongoDB drivers
const { findFiles, pushFiles } = require("../database/db");

// Middlewares:
const { uploadFiles, getFiles } = require("../database/aws");
const unlinkFile = util.promisify(fs.unlink);

router.post("/", multer(multerConfig).array("files"), async (req, res) => {
  // Request parameters:
  const { files } = req;
  const { title, message, days } = req.body;
  var day = days; // convert const to var

  if (!days || days > MAX_DAYS) day = MIN_DAYS; // avaiable days
  // If there ins't files on req. return error
  if (!files) res.status(500).send({ error: "Missing file 👎🏻" });

  // Req. variables
  const id = uuidv4(); // create id
  const data_files = []; // info objs

  // Increment time by 'n' days
  const delete_at = moment().add(day, "days").format("YYYY-MM-DD h:mm:ss a");
  const created_at = moment().format("YYYY-MM-DD h:mm:ss a");

  // Push files to S3-bucket, return file keys
  for (let index = 0; index < files.length; index++) {
    data_files.push(files[index]);
    delete files[index].fieldname; // remove unnecessary field
    await uploadFiles(files[index]); // upload file
    await unlinkFile(files[index].path); // unlink file
  }

  // Push to database
  const schema = pushFiles(
    {
      _id: id,
      details: {
        title: title,
        message: message,
      },
      files: {
        data_files: data_files,
        n_files: data_files.length,
      },
      created_at: created_at,
      delete_at: delete_at,
    },
    "temp"
  );

  // Return API response
  if (schema) {
    res.status(202).send({
      id: id,
      files: {
        data_files: data_files,
        n_files: data_files.length,
      },
      created_at: created_at,
      delete_at: delete_at,
    });
  } else {
    res.status(500).send({
      msg: "Error while pushing to db. 💀",
    });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  // Get objects from mongodb
  const object = await findFiles(id, "temp");

  // If file is only one & minetype:image, then use pipe()
  if (object.files.data_files.length == 1) {
    getFiles(object.files.data_files[0].filename).pipe(res);
  } else {
    const namefile = `sender_${object._id}.zip`;
    const path = `./temp/downloads/${namefile}`;

    // Get readStream file(s)
    const inputSources = object.files.data_files.map((element) => ({
      readStream: getFiles(element.filename),
      name: element.originalname,
    }));

    // Save local file on server as .zip
    const outputStream = fs.createWriteStream(path);

    // Zip file
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });
    archive.pipe(outputStream);
    inputSources.forEach((src) =>
      archive.append(src.readStream, { name: src.name })
    );
    archive.finalize();

    // Send files back to client
    res.attachment(path);
    archive.pipe(res);

    // Callback for delete files
    /*
    outputStream.on("end", () => {
      fs.unlinkFile(path); // unlink file
    });
    */
  }
});

module.exports = router;
