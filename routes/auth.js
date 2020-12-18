const Router = require('express');
const { check } = require('express-validator');
const { login, googleSignIn, loginToken, resPassword } = require('../bml/controllers/auth');
const { validarCampos } = require('../bml/middlewares/validar-campos');
const { validarJWT, renewJWT } = require("../bml/middlewares/validar-jwt")

const router = Router();

router.post('/login', [check('email', 'El email es requerido').not().isEmpty(),
        check('password', 'El password es requerido').not().isEmpty(),
        validarCampos
    ],
    login);
router.post('/google', [
        check('token', 'El token es requerido').not().isEmpty(), validarCampos
    ],
    googleSignIn);

router.post("/renew", [
    check("email", "El email es obligatorio").not().isEmpty(),
    check("token", "El token es obligatorio").not().isEmpty(),
    validarCampos,
], loginToken);

router.post('/reset', [
    check('email', 'El email es requerido').not().isEmpty(),
    check('password', 'El password es requerido').not().isEmpty(), validarCampos
], resPassword);

module.exports = router;