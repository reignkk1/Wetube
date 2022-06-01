import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const isHeroku = process.env.NODE_ENV === "production";

const s3ImageUploader = multerS3({
  s3: s3,
  bucket: "we2ube/images",
  acl: "public-read",
});

const s3VideoUploader = multerS3({
  s3: s3,
  bucket: "we2ube/videos",
  acl: "public-read",
});

export const localMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedInUser = req.session.user;
  res.locals.isHeroku = isHeroku;
  next();
};

export const protectMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "접근 할 수 없습니다!");
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "접근 할 수 없습니다!");
    return res.redirect("/");
  }
};

export const upLoadAvatar = multer({
  dest: "uploads/avatars",
  storage: isHeroku ? s3ImageUploader : undefined,
});
export const upLoadVideo = multer({
  dest: "uploads/videos",
  storage: isHeroku ? s3VideoUploader : undefined,
});
