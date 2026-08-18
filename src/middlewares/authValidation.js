import jwt from "jsonwebtoken"

export const authValidation = (req,res,next) => {
    const authHeader=req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            ok:false,
            msg:"Token no valido",
        })
    }
    const token= authHeader.split(" ")[1];
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch(error){
        return res.status(401).json({
            ok:false,
            msg: "Token no valido o ya ha expirado."
        })
    }
}