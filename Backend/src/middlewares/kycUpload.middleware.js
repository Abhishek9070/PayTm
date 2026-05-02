import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import ApiError from "../utils/apiErros.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const userId = req.user?._id?.toString() || "anonymous";

    return {
      folder: `paytm/kyc/${userId}`,
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      public_id: `${file.fieldname}-${Date.now()}`
    };
  }
});

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype?.startsWith("image/")) {
    cb(new ApiError(400, "Only image files are allowed for KYC uploads"));
    return;
  }

  cb(null, true);
};

export const uploadKycDocuments = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});