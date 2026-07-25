import ApiError from "../utils/apiErros.js";

export const isAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    throw new ApiError(403, "Access denied: Admin only");
  }
  next();
};