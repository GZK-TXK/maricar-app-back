import { validationResult } from 'express-validator'


export const validateImputs = (req, res, next) => {
  const errors = validationResult(req);

 if(!errors.isEmpty()){
  const result=errors
  console.log(result)
  return res.status(403).json({
    ok:false,
    errors:errors.mapped()

  })
 }

 next()
};