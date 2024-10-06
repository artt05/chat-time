const protectRoute = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};
console.log("Hello");
const allowIf = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/index");
};
const validateUpload = (req, res, next) => {
  console.log(req.body);
  if (req.fileValidationError) {
    console.log(req.fileValidationError);
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
  if (req.body.content) {
    console.log("arti6");
    if (!req.file) {
      console.log("arti7");
      next();
    } else if (req.file.size < 500000000) {
      console.log("arti8");
      next();
    } else {
      console.log("arti9");
      return res.redirect(
        `/post?error=` +
          encodeURIComponent("File is too big") +
          `&color=` +
          encodeURIComponent("danger")
      );
    }
  } else {
    console.log("arti10");
    return res.redirect(
      `/post?error=` +
        encodeURIComponent("Please type something") +
        `&color=` +
        encodeURIComponent("danger")
    );
  }
};
const validateUpload3 = (req, res, next) => {
  if (!req.file) {
    console.log("arti7");
    next();
  } else if (req.file.size < 500000000) {
    console.log("arti8");
    next();
  } else {
    console.log("arti9");
    return res.redirect(
      `/post?error=` +
        encodeURIComponent("File is too big") +
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
  validateUpload3,
};
