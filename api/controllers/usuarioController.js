import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/email.js";

// Registrar un nuevo usuario
const registrar = async (req, res) => {
    const { email, nombre, password } = req.body;

    // Verificar si el usuario ya existe
    const existeUsuario = await Usuario.findOne(email);
    if (existeUsuario) {
        return res.status(400).json({ msg: "Usuario ya registrado" });
    }

    try {
        const usuario = new Usuario(nombre, email, password);
        usuario.token = generarId();
        await usuario.save();

        // Enviar email de confirmación
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token,
        });

        res.status(200).json({ msg: "Usuario registrado correctamente. Revisa tu email para confirmar tu cuenta." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al registrar el usuario" });
    }
};

// Autenticar usuario
const autenticar = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Busca el usuario por el correo electrónico
        const usuario = await Usuario.findOne(email);
        
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verifica la contraseña usando el método comprobarPassword
        const esValido = await Usuario.comprobarPassword(email, password);
        
        if (!esValido) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Eliminar propiedades sensibles
        const usuarioSinSensibles = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            // Agrega aquí cualquier otra propiedad que desees devolver
        };

        // Genera el token JWT
        const token = generarJWT(usuario.id);  // Usa el ID del usuario para generar el token

        // En la respuesta solo devuelves los datos necesarios, incluyendo el token
        res.status(200).json({
            message: 'Usuario autenticado',
            usuario: usuarioSinSensibles,
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};


// Confirmar cuenta
const confirmar = async (req, res) => {
    const { token } = req.params;

    const usuario = await Usuario.findOneByToken(token);
    if (!usuario) {
        return res.status(404).json({ msg: "Token no válido" });
    }

    try {
        await Usuario.update(usuario.id, { confirmado: true, token: "" });
        res.status(200).json({ msg: "Cuenta confirmada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al confirmar la cuenta" });
    }
};

// Olvidé mi contraseña
const olvidePassword = async (req, res) => {
    const { email } = req.body;

    const usuario = await Usuario.findOne(email);
    if (!usuario) {
        return res.status(404).json({ msg: "El usuario no existe" });
    }

    try {
        const token = generarId();
        await Usuario.update(usuario.id, { token });

        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token,
        });

        res.status(200).json({ msg: "Hemos enviado un email con las instrucciones" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al generar el token para el cambio de contraseña" });
    }
};

// Comprobar token
const comprobarToken = async (req, res) => {
    const { token } = req.params;

    const usuario = await Usuario.findOneByToken(token);
    if (usuario) {
        res.json({ msg: "Token válido" });
    } else {
        res.status(404).json({ msg: "Token no válido" });
    }
};

// Cambiar contraseña
const nuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const usuario = await Usuario.findOneByToken(token);
    if (!usuario) {
        return res.status(404).json({ msg: "Token no válido" });
    }

    try {
        const hashedPassword = await Usuario.hashPassword(password);
        await Usuario.update(usuario.id, { password: hashedPassword, token: "" });

        res.json({ msg: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al cambiar la contraseña" });
    }
};

// Obtener perfil del usuario autenticado
const perfil = async (req, res) => {
    res.json(req.usuario);
};

// Obtener todos los usuarios
const getUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.getAll();
        res.json(usuarios);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ msg: "Error al obtener los usuarios" });
    }
};

// Actualizar usuario
const updateUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre, email, password } = req.body;

    const usuario = await Usuario.findById(id);
    if (!usuario) {
        return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    try {
        const updates = { nombre, email };
        if (password) {
            updates.password = await Usuario.hashPassword(password);
        }
        await Usuario.update(id, updates);

        res.json({ msg: "Usuario actualizado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al actualizar el usuario" });
    }
};

export {
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil,
    getUsuarios,
    updateUsuario,
};
