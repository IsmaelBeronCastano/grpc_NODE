import * as protoLoader from "@grpc/proto-loader"
import * as grpc from "@grpc/grpc-js"
import path from 'path'
import {ProtoGrpcType} from './proto/employees'
import {EmployeesService} from './src/EmployeesService'
import { SSLService } from "./ssl/SSLService"

const PORT = 8082

//ubicacion archivo proto
const PROTO_FILE="./proto/employees.proto"


//necesitamos crear una instancia de objeto de grpc usando employees.proto
//para ello importamos @grpc/proto-loader
const packageDefinition = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE)) //importamos el archivo proto

//con packageDefinition podremos obtener la definición de tipos grpc
//para ello importamos @grpc/grpc-js
//lo  tipo como unknown para poderlo castear con el tipo de la interface generada desde employees.proto volcada en employees.ts
const grpcObj= (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType //ProtoGrpcType es una interface que tiene los tipos 
                                                                                           //de todos los mensajes escritas en proto

//EN el main hago todos los llamados a las configuraciones particulares
function main(){
    const server = getServer()
    //podemos agregar tantos servicios como queramos divididos por entidades, ahora solo tenemos una
    const serverCredentials= grpc.ServerCredentials.createInsecure()//server sin autenticación

    server.bindAsync(`0.0.0.0:${PORT }`, serverCredentials, (err,port)=>{
        if(err){
            console.error(err)
            return
        }
        console.log(`Server running at port ${port}`)
        
    })
}

//configurar el server de grpc
function getServer(){
    const server = new grpc.Server()
    
    //este método recibe la definicion de un servicio como primer parámetro
    //y la implementación de ese servicio como segundo parámetro (EmployeesService.ts)
    //Si exploro employees.ts observo la definición del servicio en service: _employees_IEmployeeServiceDefinition
    //En grpcObj tengo todo
    server.addService(grpcObj.employees.IEmployeeService.service, EmployeesService)


    return server
}

main()