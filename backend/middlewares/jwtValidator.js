const expressJwt = require("express-jwt");

// Revocar autenticación a usuarios que no sean administradores
// const checkIsRevoked = async (req, payload, done) => {
//   if(!payload.isAdmin) {
//     done(null, true)
//   }

//   done()
// }

const authJwt = () => {
  return expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    // isRevoked: checkIsRevoked
  })
  // No chequear el token en las siguientes rutas
  .unless({
    path: [
      "/api/v1/user/login",
      "/api/v1/user/signup",
      {url: /\/uploads(.*)/, methods: ["GET"]},
      {url: /\/api\/v1\/products(.*)/, methods: ["GET"]},
      {url: /\/api\/v1\/categories(.*)/, methods: ["GET"]}
    ]
  })
}

module.exports = authJwt;