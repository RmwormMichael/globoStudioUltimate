// models/Usuario.js
import conectarDB from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class Usuario {

    // Obtener todos los usuarios
    static async getAll() {
        const connection = await conectarDB();  // Obtener la conexión desde la función
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM usuarios', (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);  // Asegúrate de que 'results' sea un array
                }
            });
        }).finally(() => {
            connection.end();  // Cierra la conexión después de la consulta
        });
    }

    // Obtener un usuario por su ID
    static async getById(id) {
        const connection = await conectarDB();  // Obtener la conexión desde la función
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM usuarios WHERE id = ?', [id], (error, results) => {
                if (error) {
                    reject(error);
                } else if (results.length === 0) {
                    resolve(null);  // Si no se encuentra el usuario
                } else {
                    resolve(results[0]);  // Retorna el primer usuario encontrado
                }
            });
        }).finally(() => {
            connection.end();  // Cierra la conexión después de la consulta
        });
    }

    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);  // Generar el salt
        const hashedPassword = await bcrypt.hash(password, salt);  // Encriptar la contraseña
        return hashedPassword;
    }

    // Crear un nuevo usuario
    static async create(data) {
        const connection = await conectarDB();  // Obtener la conexión desde la función
        return new Promise(async (resolve, reject) => {
            try {
                // Encriptar la contraseña antes de guardarla
                data.password = await Usuario.hashPassword(data.password);
                connection.query('INSERT INTO usuarios SET ?', data, (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);  // Retorna el ID del nuevo usuario insertado
                    }
                });
            } catch (err) {
                reject(err);
            }
        }).finally(() => {
            connection.end();  // Cierra la conexión después de la consulta
        });
    }


    // Actualizar un usuario por su ID
    static async update(id, data) {
        const connection = await conectarDB();  // Obtener la conexión desde la función
        return new Promise((resolve, reject) => {
            connection.query('UPDATE usuarios SET ? WHERE id = ?', [data, id], (error, results) => {
                if (error) {
                    reject(error);
                } else if (results.affectedRows === 0) {
                    resolve(null);  // Si no se actualizó ningún usuario
                } else {
                    resolve(results);  // Retorna los resultados de la actualización
                }
            });
        }).finally(() => {
            connection.end();  // Cierra la conexión después de la consulta
        });
    }

    // Eliminar un usuario por su ID
    static async delete(id) {
        const connection = await conectarDB();  // Obtener la conexión desde la función
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM usuarios WHERE id = ?', [id], (error, results) => {
                if (error) {
                    reject(error);
                } else if (results.affectedRows === 0) {
                    resolve(null);  // Si no se eliminó ningún usuario
                } else {
                    resolve(results);  // Retorna los resultados de la eliminación
                }
            });
        }).finally(() => {
            connection.end();  // Cierra la conexión después de la consulta
        });
    }

    // Buscar usuarios por nombre
    static async searchByName(name) {
        const connection = await conectarDB();  // Obtener la conexión desde la función
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM usuarios WHERE nombre LIKE ?', [`%${name}%`], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);  // Retorna los resultados de la búsqueda
                }
            });
        }).finally(() => {
            connection.end();  // Cierra la conexión después de la consulta
        });
    }

    static async findOne(email) {
        const connection = await conectarDB();  // Obtener la conexión desde la función
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM usuarios WHERE email = ?', [email], (error, results) => {
                if (error) {
                    reject(error);
                } else if (results.length === 0) {
                    resolve(null);  // Si no se encuentra el usuario
                } else {
                    resolve(results[0]);  // Retorna el primer usuario encontrado
                }
            });
        }).finally(() => {
            connection.end();  // Cierra la conexión después de la consulta
        });
    }


    static async comprobarPassword(email, password) {
        const connection = await conectarDB();  // Obtener la conexión desde la función
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM usuarios WHERE email = ?', [email], async (error, results) => {
                if (error) {
                    reject(error);
                } else if (results.length === 0) {
                    resolve(false);  // Usuario no encontrado
                } else {
                    const usuario = results[0];
                    try {
                        // Comparar la contraseña proporcionada con la almacenada (encriptada)
                        const esValido = await bcrypt.compare(password, usuario.password);
                        resolve(esValido);  // Devuelve 'true' si las contraseñas coinciden, 'false' si no
                    } catch (err) {
                        reject(err);
                    }
                }
            });
        }).finally(() => {
            connection.end();  // Cierra la conexión después de la consulta
        });
    }


    


}

export default Usuario;
