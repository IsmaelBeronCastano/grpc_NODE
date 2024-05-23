import { ServerCredentials } from "@grpc/grpc-js";
import *as fs from 'fs'
import path from 'path'

export class SSLService{
    static getServerCredentials():ServerCredentials{
        const serverCert = fs.readFileSync(path.resolve(__dirname,  '../../ssl/server-cert.pem')) //importamos  el certificado
        const serverKey =  fs.readFileSync(path.resolve(__dirname, '../../ssl/server-key.pem'))  //importamos la clave

        //el primer parámetro es el root del Buffer, lo mandamos como nulo
        //el segundo es un diccionario de certificados y claves
        //le  envio false como tercero para que no chequee  el certificado del cliente, eso lo haremos más adelante  
        return ServerCredentials.createSsl(null,[{cert_chain:serverCert, private_key:serverKey}], false)


    }
}