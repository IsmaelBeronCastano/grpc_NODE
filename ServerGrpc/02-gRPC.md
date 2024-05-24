# gRPC NODE - Client

- Creo el client.ts en la raíz
- Uso parte del código de server.ts como el puerto, la ubicación del archivo proto, la definición del paquete (packageDefinition) y la definición de los objetos de grpc (grpcObj)

~~~js
import * as protoLoader from "@grpc/proto-loader"
import * as grpc from "@grpc/grpc-js"
import path from 'path'
import {ProtoGrpcType} from './proto/employees'

const PORT = 8082

const PROTO_FILE="./proto/employees.proto"


const packageDefinition = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE)) //importamos el archivo proto


const grpcObj= (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType

//haremos que el server funcione de momento con las credenciales inseguras
//lo modifico en server.ts tambien, luego lo cambio
const channelCredentials= grpc.credentials.createInsecure() //notar que aqui son .credentials no ServerCredentials
const client= new grpcObj.employees.IEmployeeService(`0.0.0.0:${PORT}`, channelCredentials)

//creamos la conexión del cliente
//ncesitamos  undeadLine, un tiempo  de espera para que el cliente se conecte (5-10 segundos)
const deadLine= new Date()
deadLine.setSeconds(deadLine.getSeconds()+10) //le añado 10 segundos

//esperamos a que el cliente este listo para conectarse
client.waitForReady(deadLine, (err)=>{
    if(err){
        throw new Error('Error  creating Client')
        
    }
    onClientReady()
})

function onClientReady(){
    console.log('working!')
}
~~~

- Modifico las credenciales del server para trabajar de momento de forma insegura

~~~js
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
~~~

- Genero el script  para inicializar el cliente

~~~json
"start:client":"ts-node client.ts",
~~~

- Por ahora solo nos devuelve el console.log y se cierra la conexión 
- Porué dispongo de  los métodos desde client? 
- Al crearlo apunta a la nterfaz de servicio

~~~js
const client= new grpcObj.employees.IEmployeeService(`0.0.0.0:${PORT}`, channelCredentials)
~~~

- Si miro la interfaz

~~~js
export interface ProtoGrpcType {
  employees: {
    AddPhotoRequest: MessageTypeDefinition
    AddPhotoResponse: MessageTypeDefinition
    Employee: MessageTypeDefinition
    EmployeeRequest: MessageTypeDefinition
    EmployeeResponse: MessageTypeDefinition
    GetAllRequest: MessageTypeDefinition
    GetByBadgeNumberRequest: MessageTypeDefinition            //puedo clicar encima de esta interfaz
    IEmployeeService: SubtypeConstructor<typeof grpc.Client, _employees_IEmployeeServiceClient> & { service: _employees_IEmployeeServiceDefinition }
  }
}
~~~

-Si voy a _employees_IEmployeeServiceClient veo como me define todo estos métodos en IEmployeeService

~~~js
export interface IEmployeeServiceClient extends grpc.Client {
  AddPhoto(metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_employees_AddPhotoResponse__Output>): grpc.ClientWritableStream<_employees_AddPhotoRequest>;
  AddPhoto(metadata: grpc.Metadata, callback: grpc.requestCallback<_employees_AddPhotoResponse__Output>): grpc.ClientWritableStream<_employees_AddPhotoRequest>;
  AddPhoto(options: grpc.CallOptions, callback: grpc.requestCallback<_employees_AddPhotoResponse__Output>): grpc.ClientWritableStream<_employees_AddPhotoRequest>;
  AddPhoto(callback: grpc.requestCallback<_employees_AddPhotoResponse__Output>): grpc.ClientWritableStream<_employees_AddPhotoRequest>;
  addPhoto(metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_employees_AddPhotoResponse__Output>): grpc.ClientWritableStream<_employees_AddPhotoRequest>;
  addPhoto(metadata: grpc.Metadata, callback: grpc.requestCallback<_employees_AddPhotoResponse__Output>): grpc.ClientWritableStream<_employees_AddPhotoRequest>;
  addPhoto(options: grpc.CallOptions, callback: grpc.requestCallback<_employees_AddPhotoResponse__Output>): grpc.ClientWritableStream<_employees_AddPhotoRequest>;
  addPhoto(callback: grpc.requestCallback<_employees_AddPhotoResponse__Output>): grpc.ClientWritableStream<_employees_AddPhotoRequest>;
  
  GetByBadgeNumber(argument: _employees_GetByBadgeNumberRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_employees_EmployeeResponse__Output>): grpc.ClientUnaryCall;
  GetByBadgeNumber(argument: _employees_GetByBadgeNumberRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_employees_EmployeeResponse__Output>): grpc.ClientUnaryCall;
  GetByBadgeNumber(argument: _employees_GetByBadgeNumberRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_employees_EmployeeResponse__Output>): grpc.ClientUnaryCall;
  GetByBadgeNumber(argument: _employees_GetByBadgeNumberRequest, callback: grpc.requestCallback<_employees_EmployeeResponse__Output>): grpc.ClientUnaryCall;
  getByBadgeNumber(argument: _employees_GetByBadgeNumberRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_employees_EmployeeResponse__Output>): grpc.ClientUnaryCall;
  getByBadgeNumber(argument: _employees_GetByBadgeNumberRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_employees_EmployeeResponse__Output>): grpc.ClientUnaryCall;
  getByBadgeNumber(argument: _employees_GetByBadgeNumberRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_employees_EmployeeResponse__Output>): grpc.ClientUnaryCall;
  getByBadgeNumber(argument: _employees_GetByBadgeNumberRequest, callback: grpc.requestCallback<_employees_EmployeeResponse__Output>): grpc.ClientUnaryCall;
  
  Save(argument: _employees_EmployeeRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_employees_EmployeeResponse__Output>): grpc.ClientUnaryCall;
  Save(argument: _employees_EmployeeRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_employees_EmployeeResponse__Output>): grpc.ClientUnaryCall;
  Save(argument: _employees_EmployeeRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_employees_EmployeeResponse__Output>): grpc.ClientUnaryCall;
  Save(argument: _employees_EmployeeRequest, callback: grpc.requestCallback<_employees_EmployeeResponse__Output>): grpc.ClientUnaryCall;
  save(argument: _employees_EmployeeRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_employees_EmployeeResponse__Output>): grpc.ClientUnaryCall;
  save(argument: _employees_EmployeeRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_employees_EmployeeResponse__Output>): grpc.ClientUnaryCall;
  save(argument: _employees_EmployeeRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_employees_EmployeeResponse__Output>): grpc.ClientUnaryCall;
  save(argument: _employees_EmployeeRequest, callback: grpc.requestCallback<_employees_EmployeeResponse__Output>): grpc.ClientUnaryCall;
  
  SaveAll(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_employees_EmployeeRequest, _employees_EmployeeResponse__Output>;
  SaveAll(options?: grpc.CallOptions): grpc.ClientDuplexStream<_employees_EmployeeRequest, _employees_EmployeeResponse__Output>;
  saveAll(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_employees_EmployeeRequest, _employees_EmployeeResponse__Output>;
  saveAll(options?: grpc.CallOptions): grpc.ClientDuplexStream<_employees_EmployeeRequest, _employees_EmployeeResponse__Output>;
  
  getAll(argument: _employees_GetAllRequest, metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientReadableStream<_employees_EmployeeResponse__Output>;
  getAll(argument: _employees_GetAllRequest, options?: grpc.CallOptions): grpc.ClientReadableStream<_employees_EmployeeResponse__Output>;
  
}
~~~

- Entonces, el cliente tiene el método de getByBadgeNumber que es el qe usaremos ahora

~~~js
import * as protoLoader from "@grpc/proto-loader"
import * as grpc from "@grpc/grpc-js"
import path from 'path'
import {ProtoGrpcType} from './proto/employees'

const PORT = 8082

const PROTO_FILE="./proto/employees.proto"


const packageDefinition = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE)) //importamos el archivo proto


const grpcObj= (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType

//haremos que el server funcione de momento con las credenciales inseguras
//lo modifico en server.ts tambien, luego lo cambio
const channelCredentials= grpc.credentials.createInsecure() //notar que aqui son .credentials no ServerCredentials
const client= new grpcObj.employees.IEmployeeService(`0.0.0.0:${PORT}`, channelCredentials) //el cliente apunta a la interfaz del servicio.
                                                                                            //dispongo  de todos los métodos

//creamos la conexión del cliente
//ncesitamos  undeadLine, un tiempo  de espera para que el cliente se conecte (5-10 segundos)
const deadLine= new Date()
deadLine.setSeconds(deadLine.getSeconds()+10) //le añado 10 segundos

//esperamos a que el cliente este listo para conectarse
client.waitForReady(deadLine, (err)=>{
    if(err){
        throw new Error('Error  creating Client')
        
    }
    onClientReady()
})


//Creo el método usando client
const getEmployeeByBadgeNumber = ()=>{
    client.getByBadgeNumber({badgeNumber: 2010}, (err, response)=>{
        if(err){
            console.error(err)
            return
        }
        console.log(`Employee: with badgeNumber ${response?.employee?.badgeNumber} has name ${response?.employee?.firstName}`)
    
    })
}

//lo añado a la función que se ejecuta en la conexión 
function onClientReady(){
    getEmployeeByBadgeNumber()
}
~~~

- Ejecuto el server y el cliente con los scripts correspondientes
-  Sigo conlo otros métodos, save.
-  En el server, save es así

~~~js
Save: function (call: ServerUnaryCall<EmployeeRequest__Output, EmployeeResponse>, callback: sendUnaryData<EmployeeResponse>): void {
    const req = call.request as EmployeeRequest
    if(req.employee){
        const employee = req.employee
        _employeesDB.saveEmployee(employee)
        callback(null, {employee})
    }

    callback({
        name: "employee is undefined",
        message:"invalid input"
    }, null)
},
~~~

- En el cliente es  así

~~~js
const saveEmployee= ()=>{
    const employee:  Employee ={
        id: 1000,
        badgeNumber: 2080,
        firstName: "John",
      
    }

    client.save({employee}, (err, response)=>{
        if(err){
            console.error(err)
            return
        }
        console.log(`Employee saved with badgeNumber: ${response?.employee?.badgeNumber}`)
    })

}

function onClientReady(){
    //getEmployeeByBadgeNumber()
    saveEmployee()
}
~~~

## Mensajes - Server Streaming

- Construiremos  getAll
- Si yo poso el cursor encima de getAll puedo ver con la ayuda del IDE que es un grpc.CientReadableStream que nos va a devolver un EmployeeResponse

~~~js
const getAll= ()=>{
    client.getAll
}
~~~

- Empty es un objeto vacío  que viene de protobuf. Con esto envío un objeto vacío en la petición

~~~js
import {Empty} from 'google-protobuf/google/protobuf/empty_pb'
~~~

- El método

~~~js
const getAll= ()=>{
    const stream = client.getAll(new Empty()) //este stream nos va a permitir escuchar eventos
    
    const employees:Employee[]= []

    stream.on('data', (response)=>{
        const employee = response.employee
        employees.push(employee)
        console.log(`Fetch employeewith badgeNumber ${employee.badgeNumber}`) //cada vez que obtengamos datos se imprimirá
        //cada chunk de datos será un empleado
    })

    stream.on('error', (err)=>{
        //en un entorno de producción aqui se hacen políticas de reintentos, reestablecer la conexión,o usar otros frameworks
        //como temporal.io para que las ejecuciones que no se completaron de forma exitosa se completen aunque haya habido un error 
        console.log(err)
    })
    stream.on('end', ()=>{
        console.log(`${employees.length} total employees`)
    })
}
~~~

## Mensajes - Client Streaming 

- AddPhoto desde el cliente
- Hago lo mismo, escribo client.AddPhoto y observo los tipos posando el cursor encima

~~~js
(method) IEmployeeServiceClient.AddPhoto(metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<AddPhotoResponse__Output>): grpc.ClientWritableStream<AddPhotoRequest> 
~~~

- Observo que la response es de tipo  grpc.ClientWritableStream<AddPhotoRequest> 
- Para implementar este métodono necesitamos nada, podemos enviar un callback vacío

~~~js
const addPhoto =()=>{
   const stream= client.AddPhoto(()=>{})
    //con fs vamos a crear un readstream que nospermitirá leer un png, descomponerlo en chunks y enviárselo al server 
    const fileStream= fs.createReadStream('./badgePhoto.png')

    fileStream.on('data', (chunk)=>{
        stream.write({data: chunk})
    })

    fileStream.on('end',  ()=>{
        stream.end()
    })

}
~~~

- Esto me crea un archivo en la raíz llamado upload_photo.png
---

## Mensajes - Bidirectional Streaming

- Por cada vez que se guarde un cliente el servidor me va a devolver una respuesta
- Alguien tiene que cerrar la conexión (el cliente o el servidor)
- Por  la naturaleza de este método, es  elcliente quien está enviando. Cuando terminecierra el streaming
-client.ts

~~~js
const saveAll=()=>{
    const stream= client.saveAll() //esto crea el canal

    const employeesToSave =[
        {
            id: 4,
            badgeNumber: 2090,
            firstName: 'Johnee',
            lastName: 'Scofieldaaa',
            vacationAccrualRate: 50,
            vacationAccrued: 120
        },
        {
            id: 5,
            badgeNumber: 2023,
            firstName: 'Johneet',
            lastName: 'Scofieldaaarrr',
            vacationAccrualRate: 50,
            vacationAccrued: 120
        }

    ]

    const employees:Employee []= []
    stream.on('data',(response)=>{
        employees.push(response.employee)
        console.log('employee saved!')
    })
    stream.on('error',(err)=>{
        console.log(err)
    })

    stream.on('end',()=>{
        console.log(employees.length)
    })

    employeesToSave.forEach(employee=>{
        stream.write({employee})
    })

    //cierro la conexión
    stream.end()

}

function onClientReady(){
    //getEmployeeByBadgeNumber()
    //saveEmployee()
    //getAll()
    //addPhoto()
    saveAll()
}
~~~
-----

## Estalecer conexión segura

- Habilitamos la conexion segura en el  server

~~~js
function main(){
    const server = getServer()

    const serverCredentials= SSLService.getServerCredentials()

    server.bindAsync(`0.0.0.0:${PORT }`, serverCredentials, (err,port)=>{
        if(err){
            console.error(err)
            return
        }
        console.log(`Server running at port ${port}`)
        
    })
}
~~~

- Creo otro método estático en SSLService

~~~js
import { ChannelCredentials, ServerCredentials } from "@grpc/grpc-js";
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

    static getChannelCredentials(): ChannelCredentials{
        const rootCert = fs.readFileSync(path.resolve(__dirname, './../ssl/ca-cert.pem'))

        return ChannelCredentials.createSsl(rootCert)
    }
}
~~~

- LLamo el método en el cliente

~~~js
const channelCredentials= SSLService.getChannelCredentials()
const client=new grpcObj.employees.IEmployeeService(`0.0.0.0:${PORT}`, channelCredentials)
~~~