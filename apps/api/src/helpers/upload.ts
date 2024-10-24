// import multer from 'multer';
// import path from 'path';

// export class Upload {
//   private storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//       cb(null, `${Date.now()}-${file.originalname}`);
//     },
//   });

//   private fileFilter = (req: any, file: any, cb: any) => {
//     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
//     if (!allowedTypes.includes(file.mimetype)) {
//       return cb(
//         new Error('Only .jpeg, .jpg, .png, .gif formats allowed!'),
//         false,
//       );
//     }
//     cb(null, true);
//   };

//   private upload = multer({
//     storage: this.storage,
//     limits: { fileSize: 1024 * 1024 }, // 1MB limit
//     fileFilter: this.fileFilter,
//   });

//   public getUploader() {
//     return this.upload;
//   }
// }
