const fileSchema = {
  _id: String,
  details: {
    title: String,
    message: String,
  },
  files: {
    data_files: Array,
    n_files: Number,
  },
  created_at: Date,
  delete_at: Date,
};

module.exports = fileSchema;
