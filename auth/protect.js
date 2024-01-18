const protectRoute = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};
const allowIf = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/index");
};
const validateUpload = (req, res, next) => {
  if (req.fileValidationError) {
    return res.redirect(
      `/post?error=` +
        encodeURIComponent("You cant post this type of file") +
        `&color=` +
        encodeURIComponent("danger")
    );
  } else {
    next();
  }
};
const validateUpload2 = (req, res, next) => {
  if (req.content) {
    if (!req.file) {
      next();
    } else if (req.file.size < 500000000) {
      next();
    } else {
      return res.redirect(
        `/post?error=` +
          encodeURIComponent("File is too big") +
          `&color=` +
          encodeURIComponent("danger")
      );
    }
  } else {
    return res.redirect(
      `/post?error=` +
        encodeURIComponent("Please type something") +
        `&color=` +
        encodeURIComponent("danger")
    );
  }
};
module.exports = {
  protectRoute,
  allowIf,
  validateUpload,
  validateUpload2,
};
