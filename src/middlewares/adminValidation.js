export const adminValidation = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ ok: false, msg: "No tienes permisos de administrador" });
  }
  next();
};