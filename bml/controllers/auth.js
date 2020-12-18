const { querySingle } = require('../../dal/data-access');
const { response } = require('../../routes/auth');
const bcrypt = require('bcryptjs');
const { generateJWT } = require('../helpers/jwt');
const { googleVerify } = require('../helpers/google-verify');

const login = async(req, res = response) => {
    const { email, password } = req.body;
    let usuario = null;
    const sqlParams = [{
        'name': 'email',
        'value': email
    }];

    usuario = await querySingle('stp_usuarios_login', sqlParams);
    if (!usuario) {
        res.json({
            status: false,
            message: 'Email no encontrado',
            data: null
        });
    }

    const validPassword = bcrypt.compareSync(password, usuario.password);

    if (!validPassword) {
        res.json({
            status: false,
            message: 'Contraseña incorrecta',
            data: null
        });
    }

    const token = await generateJWT(usuario.id);

    res.json({
        status: true,
        message: 'Acceso correcto',
        data: token
    });
}

const googleSignIn = async(req, res = response) => {
    const googleToken = req.body.token;
    let usuario = null;
    let sqlParams = null;

    try {
        const { name, email, picture } = await googleVerify(googleToken);
        sqlParams = [{
            'name': 'email',
            'value': email
        }];
        usuario = await querySingle('stp_usuarios_login', sqlParams);

        if (!usuario) {
            //crear usuario
            sqlParams = [{
                    'name': 'nombre',
                    'value': name
                },
                {
                    'name': 'email',
                    'value': email
                },
                {
                    'name': 'password',
                    'value': ''
                },
                {
                    'name': 'imagen',
                    'value': picture
                },
                {
                    'name': 'local',
                    'value': 0
                },
                {
                    'name': 'google',
                    'value': 1
                }
            ];

            usuario = await querySingle('stp_usuarios_add', sqlParams);
        } else {
            //actualizar usuario
            sqlParams = [{
                    'name': 'idUsuario',
                    'value': usuario.idUsuario
                },
                {
                    'name': 'nombre',
                    'value': usuario.nombre,

                },
                {
                    'name': 'email',
                    'value': usuario.email
                },
                {
                    'name': 'password',
                    'value': usuario.password
                },
                {
                    'name': 'imagen',
                    'value': usuario.imagen
                },
            ];
            usuario = await querySingle('stp_usuarios_update', sqlParams);
        }
        const token = await generateJWT(usuario.idUsuario);
        console.log(token);
        console.log(usuario);

        res.json({
            status: true,
            message: 'Acceso a google correcto',
            data: token
        });
    } catch (err) {
        res.json({
            status: false,
            message: 'Acceso a google incorrecto',
            data: err
        });
    }
}

const loginToken = async(req, res = response) => {
    const { email, token } = req.body;
    const sqlParams = [{
        'name': 'email',
        'value': email
    }, ];
    const usuario = await querySingle('stp_usuarios_login', sqlParams);
    if (usuario) {
        const token2 = await generateJWT(usuario.idUsuario);
        res.json({
            status: true,
            message: 'Acceso correcto',
            data: token2,
        });
    } else {
        res.json({
            status: false,
            message: 'error',
            data: null,
        });
    }

}

const resPassword = async(req, res) => {
    const { email, password } = req.body;
    const salt = bcrypt.genSaltSync();
    const newPassword = bcrypt.hashSync(password, salt);
    const sqlParams = [{
            'name': 'email',
            'value': email
        },
        {
            'name': 'password',
            'value': newPassword
        }
    ];
    let usuarios = await querySingle('stp_usuarios_reseteo', sqlParams);
    if (usuarios) {
        res.json({
            status: true,
            message: 'Password restablecida',
            data: usuarios
        });
    } else {
        res.json({
            status: false,
            message: 'No se encontro el email',
            data: null
        });
    }
}


module.exports = {
    login,
    googleSignIn,
    loginToken,
    resPassword
};