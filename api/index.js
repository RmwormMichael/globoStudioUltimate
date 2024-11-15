import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectarDB from "./config/db.js";
import usuarioRoute from './routes/usuarioRoutes.js';


const app = express();
app.use(express.json());

dotenv.config();

connectarDB();

/* const whitelist = [process.env.FRONTEND_URL];

const blacklist = [];

const corsOptions = {
    origin: function(origin, callback){
        if(whitelist.includes(origin)){
            callback(null, true);
        }else{
            callback(new Error("Error de cors"));
        }
    }
}

app.use(cors(corsOptions));
 */
//Routing

app.use('/api/usuarios', usuarioRoute);



const PORT = process.env.PORT || 4000;

const servidor = app.listen(4000, () =>{
    console.log(`servidor corriendo en el puerto ${PORT}`)
});
