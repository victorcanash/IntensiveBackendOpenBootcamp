import multer from 'multer';


const katasStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/tmp/uploads/katas');
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
      }
});

const fileFilter = (req: any, file: any, cb: any) => {

    // The function should call `cb` with a boolean
    // to indicate if the file should be accepted
  
    // To reject this file pass `false`, like so:
    // cb(null, false);
  
    // To accept the file pass `true`, like so:
    cb(null, true);
  
    // You can always pass an error if something goes wrong:
    // cb(new Error('I don\'t have a clue!'));  
};

const katasMulter = multer({ 
    storage: katasStorage,
    limits: {
        fieldNameSize: 100,
        fieldSize: 1000,
    },
    fileFilter: fileFilter,
    preservePath: false
});

export const katasMulterFieldName = 'file';
export const katasMulterSingle = katasMulter.single(katasMulterFieldName);
