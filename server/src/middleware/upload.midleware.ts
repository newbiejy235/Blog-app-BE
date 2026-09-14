import multer from "multer"

const storage = multer.memoryStorage()

export const  uploadSingleImages = multer({
    storage,
    limits : {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter : (_req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true)
        }else{
            cb(new Error("Hanya file gambar yang di izinkan!"))
        }
    }

}).single("image")