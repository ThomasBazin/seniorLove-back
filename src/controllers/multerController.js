//test multer

const multerController = {
  testMulter: (req, res) => {
    // The file information is available in req.file
    if (req.file) {
      res.send({
        message: 'File uploaded successfully',
        file: req.file,
      });
    } else {
      res.status(400).send({ message: 'No file uploaded' });
    }
  },
};

export default multerController;
