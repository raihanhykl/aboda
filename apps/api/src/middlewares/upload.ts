import { ErrorHandler } from '@/helpers/response';
import multer from 'multer';
import { join } from 'path';

export const Uploader = (prefix: string, folderName: string) => {
  const defaultFolder = join(__dirname, '../public/images/');
  const maxSize = 504876 * 4;
  const config: multer.Options = {
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
        return cb(new ErrorHandler('Only image files are allowed!', 400));
      }
      const fileSize = parseInt(req.headers['content-length'] || '');
      if (fileSize > maxSize) {
        return cb(new ErrorHandler('File is bigger than 5MB!', 400));
        // throw new ErrorHandler('File is bigger than 5MB!', 400);
      }
      cb(null, true);
    },
  };

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const destination = defaultFolder + folderName;
      cb(null, destination);
    },
    filename: function (req, file, cb) {
      const originalNamePart = file.originalname.split('.');
      const extension = originalNamePart[originalNamePart.length - 1];
      const newFile = `${prefix}-${Date.now()}.${extension}`;
      cb(null, newFile);
    },
  });

  return multer({ storage, ...config });
};
