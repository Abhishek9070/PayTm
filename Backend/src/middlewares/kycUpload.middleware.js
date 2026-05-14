import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import ApiError from "../utils/apiErros.js";

const createImageUploader = ({ folder, errorMessage }) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const userId = req.user?._id?.toString() || "anonymous";

      return {
        folder: `paytm/${folder}/${userId}`,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        public_id: `${file.fieldname}-${Date.now()}`
      };
    }
  });

  const imageFileFilter = (req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      cb(new ApiError(400, errorMessage));
      return;
    }

    cb(null, true);
  };

  return multer({
    storage,
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024
    }
  });
};

export const uploadKycDocument = createImageUploader({
  folder: "kyc",
  errorMessage: "Only image files are allowed for KYC uploads"
});

export const uploadProfileImage = createImageUploader({
  folder: "profiles",
  errorMessage: "Only image files are allowed for profile uploads"
});