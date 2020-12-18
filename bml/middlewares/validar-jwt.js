const jwt = require('jsonwebtoken');
const { generateJWT } = require('../helpers/jwt')

const validarJWT = (req, res, next) => {
    const token = req.header('x-token');

    if (!token) {
        return res.status(401).json({
            status: false,
            message: 'No existe token en la petición',
            data: null,
        });
    }

    try {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        req.id = id;
        next();
    } catch (error) {
        return res.json({
            status: false,
            message: 'Token invalido',
            data: null,
        });
    }
}

const renewJWT = async(req, res, next) => {
    const token = req.header('x-token');
    if (!token) {
        return res.json({
            status: false,
            message: 'No existe token',
            data: null
        });
    }
    try {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        req.id = id;
        const newtoken = await generateJWT(id);
        return res.json({
            status: true,
            message: 'Token valido',
            data: newtoken
        });
        next();
    } catch (error) {
        return res.json({
            status: false,
            message: 'Token invalido',
            data: null
        });
    }
}

module.exports = {
    validarJWT,
    renewJWT,
}