# 01 gRPC APUNTES

- Creo el archivo .node-version (linux y mac)

~~~
20.10.0
~~~

> npm init -y

- Dependencias:

> npm i @ypes/google-protobuf grpc_tools_node_protoc_ts ts-node typescript -D

- Estas dependencias no son de desarrollo (estas nospermitirán generar el código)

> npm i @grpc/grpc-js @grpc/proto-loader
-----

## Construir archivo proto

- Creo la carpeta proto en la raíz
- Creo el archivo de ejemplo  employees.proto
- Defino la sintaxis
- Defino los paquetes para la posterior autogeneración de código
- Defino la entidad
- Defino los servicios
- Defino los tipos de Request y Response

~~~proto
//declaro la sintaxis con la que voy a trabajar
syntax = "proto3";

//sección de paquetes (nombrará los paquetes autogenerados)
package employees;
option go_package = "grpc-node/basic/pb/employees";
option csharp_namespace = "Employees";

//Creo mi entidad  (tipando las propiedades)
message Employee{
    int32 id = 1;
    int32 badgeNumber= 2;
    string firstName = 3;
    string lastName = 4;
    float vacationAccrualRate = 5;
    float vacationAccrued = 6;
}

//Se pueden crear tipos de datosparticulares y ser asociados mediante contenedores

//Defino los servicios (lo que va a ser el puente entre el servidor y el cliente)
//Como va a generar una interfaz le coloco I al principio (por convención)
service IEmployeeService{
    rpc GetByBadgeNumber(GetByBadgeNumberRequest) returns (EmployeeResponse);
    //getByBadgeNumberRequest y EmployeeResponse son dos tipos de datos que todavía no he construido
    //es un servicio unario porque a una petición me devuelve un solo response

    rpc Save(EmployeeRequest) returns (EmployeeResponse);

    rpc getAll(GetAllRequest) returns (stream EmployeeResponse); //devuelve un stream, significa que es un servicio de streaming dlldo del servidor
                                                                //cuando el servidor considere que ha enviado todos los datos cerrará la conexión
                                                                //me enviará el flujo de datos de tods los EmployeeResponse, tantos  como tenga en  mi 

    rpc AddPhoto (stream AddPhotoRequest) returns (AddPhotoResponse);
    //streaming del lado del ciente; el cliente va a enviar datos hasta que considere que ha enviado todos los datos y cierre la conexión
    //Cuando cierre la  conexión el servidor va a entender que ha terminado y va a emitir la Response 
    
    rpc SaveAll (stream EmployeeRequest) returns (stream EmployeeResponse);
    //tendrmos streaming del lado del servidor  y del cliente
    //Cualquiera de los dos puede cerrar la conexión y una vez se cierra el servidor procesa y devuelve la Response
    //El servidor también puede devolver una Response a cada petición, cada 10 peticiones, etc
   //Puedo enviar datos y recibirlos de fora arbitraria                                      
 }


message GetByBadgeNumberRequest{
    int32 badgeNumber = 1; //contiene un entero con el nombre de atributo badgeNumber que nos va a permitir recibir el número de badge de cualquier empleado
}

message EmployeeResponse{
    Employee employee = 1; //agrupa la abstracción de Employee
}

message EmployeeRequest{
    Employee employee = 1;
}

message AddPhotoRequest{
    bytes data = 1; //vamos  a eeenviar bytes de una foto en varios paquetes hasta enviar toda la foto 
}

message AddPhotoResponse {
    bool isOk = 1;
}

message GetAllRequest{}
~~~

- Para generar el autocódigo creo una carpeta enla raíz llamada scripts/proto-gen.sh
- Primero le digo ue es un archivo bash
- Le indico el directorio donde estoy almacenando los archivos .proto
- Escribo el comando: uso npm para invocar proto-loader que genera los archivos ts definidos en .proto con lasopciones de la librería grpc-js, y le indico el directorio de salida

~~~sh
#!/bin/bash

PROTO_DIR=./../proto

yarn proto-loader-gen-types --grpcLib=@grpc/grpc-js --outDir=proto/ proto/*.proto
~~~

- Creo el script en el json

~~~json
 "scripts": {
    "proto:gen": "sh scripts/proto-gen.sh"
  }
~~~

- Lo ejecuto, me genera employees.ts y un archivo .ts por cada servicio
- employees.ts  

~~~js
import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { IEmployeeServiceClient as _employees_IEmployeeServiceClient, IEmployeeServiceDefinition as _employees_IEmployeeServiceDefinition } from './employees/IEmployeeService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  employees: {
    AddPhotoRequest: MessageTypeDefinition
    AddPhotoResponse: MessageTypeDefinition
    Employee: MessageTypeDefinition
    EmployeeRequest: MessageTypeDefinition
    EmployeeResponse: MessageTypeDefinition
    GetAllRequest: MessageTypeDefinition
    GetByBadgeNumberRequest: MessageTypeDefinition
    IEmployeeService: SubtypeConstructor<typeof grpc.Client, _employees_IEmployeeServiceClient> & { service: _employees_IEmployeeServiceDefinition }
  }
}
~~~

-En cada archivo hay una interfaz de la Request o la Resonse y el output
-Por ejemplo, en Employee.ts

~~~js
// Original file: proto/employees.proto


export interface Employee {
  'id'?: (number);
  'badgeNumber'?: (number);
  'firstName'?: (string);
  'lastName'?: (string);
  'vacationAccrualRate'?: (number | string);
  'vacationAccrued'?: (number | string);
}

export interface Employee__Output {
  'id'?: (number);
  'badgeNumber'?: (number);
  'firstName'?: (string);
  'lastName'?: (string);
  'vacationAccrualRate'?: (number);
  'vacationAccrued'?: (number);
}
~~~


- Si analizo el cliente que me ha generado (ctrl+click sobre _employees_IEmployeeServiceClient) puedo oservar una sobrecarga demétodos importante
- Porque podemos enviar metadatos, opciones, solo o con callbacks
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
----

## Mensajes - Unary

- Hemos creado .proto con la definición de mi entidad y la interfaz de servicio, toca implementar esos servicios
- Crearemos una  DB simulada
- Creo la carpeta src/EmployeesDB.ts

~~~js
import {Employee} from '../proto/employees/Employee'

export class EmployeesDB{

    private employees: Employee [] =[]

    constructor(){
        this.employees = [
            {
                id: 1,
                badgeNumber: 2080,
                firstName: 'Grace',
                lastName: 'Decker',
                vacationAccrualRate: 2,
                vacationAccrued: 30
            },
            {
                id: 2,
                badgeNumber: 2030,
                firstName: 'Peter',
                lastName: 'Doherty',
                vacationAccrualRate: 4,
                vacationAccrued: 25
            },
            {
                id: 3,
                badgeNumber: 2010,
                firstName: 'John',
                lastName: 'Scofield',
                vacationAccrualRate: 5,
                vacationAccrued: 12
            }
        ]
    }


    public getEmployees(): Employee[]{
        return this.employees
    }

    public saveEmployee(employee: Employee): Employee{
        this.employees.push(employee)
        return employee
    }

    public getEmployeeBybadgeNumber(badgeNumber: number): Employee | undefined{
        const employee = this.employees.find(employee => employee.badgeNumber === badgeNumber)
        if(!employee){
            throw new Error('Employee not found')
        }
        return employee
    }

} 
~~~

- En los archivos generados (concretamente en proto/IEmployeeService) encuentro la interfaz del servicio 

~~~js
export interface IEmployeeServiceHandlers extends grpc.UntypedServiceImplementation {
  AddPhoto: grpc.handleClientStreamingCall<_employees_AddPhotoRequest__Output, _employees_AddPhotoResponse>;
  
  GetByBadgeNumber: grpc.handleUnaryCall<_employees_GetByBadgeNumberRequest__Output, _employees_EmployeeResponse>;
  
  Save: grpc.handleUnaryCall<_employees_EmployeeRequest__Output, _employees_EmployeeResponse>;
  
  SaveAll: grpc.handleBidiStreamingCall<_employees_EmployeeRequest__Output, _employees_EmployeeResponse>;
  
  getAll: grpc.handleServerStreamingCall<_employees_GetAllRequest__Output, _employees_EmployeeResponse>;
  
}
~~~

-Al tipar el servicio en EmployeeService.ts (el archivo que he cread para implementar los servicios) me marca error porque faltanlosmétodos
- Con quick fix del IDE lo arreglo al instante (ojo que el servicio no lo estoy construyendo como una clase!)

~~~js
import { ServerReadableStream, sendUnaryData, ServerUnaryCall, ServerDuplexStream, ServerWritableStream } from "@grpc/grpc-js";
import { AddPhotoRequest__Output } from "../proto/employees/AddPhotoRequest";
import { AddPhotoResponse } from "../proto/employees/AddPhotoResponse";
import { EmployeeRequest__Output } from "../proto/employees/EmployeeRequest";
import { EmployeeResponse } from "../proto/employees/EmployeeResponse";
import { GetAllRequest__Output } from "../proto/employees/GetAllRequest";
import { GetByBadgeNumberRequest, GetByBadgeNumberRequest__Output } from "../proto/employees/GetByBadgeNumberRequest";
import { IEmployeeServiceHandlers } from "../proto/employees/IEmployeeService";
import { EmployeesDB } from "./EmployeesDB";


const _employeesDB = new EmployeesDB()


const  EmployeesService : IEmployeeServiceHandlers={
    
    AddPhoto: function (call: ServerReadableStream<AddPhotoRequest__Output, AddPhotoResponse>, callback: sendUnaryData<AddPhotoResponse>): void {
        throw new Error("Function not implemented.");
    },

    GetByBadgeNumber: function (call: ServerUnaryCall<GetByBadgeNumberRequest__Output, EmployeeResponse>, callback: sendUnaryData<EmployeeResponse>): void {
        const req = call.request as GetByBadgeNumberRequest //lo casteo al objeto que necesito trabajar
        //si reviso os archivos generados, GetByBadgNumberReuest.ts tiene un badgeNumber

        if(req.badgeNumber){
            const badgeNumber = req.badgeNumber
            const employee = _employeesDB.getEmployeeBybadgeNumber(badgeNumber) 
                callback(null, {employee}) 
        }

        //si no hay employee volvemos a usar elcallback para indicar el error
        callback({
            name: "badgeNumber is undefined",
            message:"invalid input"
        }, {employee: undefined})

    },

    Save: function (call: ServerUnaryCall<EmployeeRequest__Output, EmployeeResponse>, callback: sendUnaryData<EmployeeResponse>): void {
        throw new Error("Function not implemented.");
    },
    SaveAll: function (call: ServerDuplexStream<EmployeeRequest__Output, EmployeeResponse>): void {
        throw new Error("Function not implemented.");
    },
    getAll: function (call: ServerWritableStream<GetAllRequest__Output, EmployeeResponse>): void {
        throw new Error("Function not implemented.");
    }
}

export {
    EmployeesService
}
~~~

-Para prbar que el servicio funcione debemos crear el servidor!
-En la raíz creo sever.ts

~~~js
import * as protoLoader from "@grpc/proto-loader"
import * as grpc from "@grpc/grpc-js"
import path from 'path'
import {ProtoGrpcType} from './proto/employees'
import {EmployeesService} from './src/EmployeesService'

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
                                                                                           //de todos los mensajes

//EN el main hago todos los llamados a las configuraciones particulares
function main(){
    //podemos agregar tantos servicios como queramos divididos por entidades, ahora solo tenemos una
    const server = getServer()
    const serverCredentials= grpc.ServerCredentials.createInsecure()//server sin autenticación

    //usamos bindAsync para conectar el server al localhost:puerto, el segundo parametro  es el tipo de auth (aqui sin auth)
    //el tercer parámetro es un callback que me devuelve el error o el puerto donde se pudo conectar
    server.bindAsync(`0.0.0.0:${PORT}`, serverCredentials, (err, port)=>{
            if(err){
                console.log(err)
                return
            }
            console.log(`Conectado en el puerto ${port}`)
            //server.start() --->deprecated!
    })
}

//configurar el server de grpc
function getServer(){
    const server = new grpc.Server()
    
    //este método recibe la definicion de un servicio como primer parámetro
    //y la implementación de ese servicio como segundo parámetro (EmployeesService.ts)
    //Si exploro employees.ts observo la definición delservicio en service: _employees_IEmployeeServiceDefinition
    //En grpcObj tengo todo
    server.addService(grpcObj.employees.IEmployeeService.service, EmployeesService)


    return server
}

main()
~~~

- Creo el script para iniciar el server

~~~json
"start:server":"ts-node server.ts"
~~~

- Usamos POSTMAN para usarlo como cliente
- import a  proto  file e importo employees com una nueva API
- Ahora puedo seleccionar un método
- Le añado badgeNumber al mensaje
-------

## Mensajes - Server Streaming

- Vamos con obtener  todos los empleados

~~~js
 getAll: function (call: ServerWritableStream<GetAllRequest__Output, EmployeeResponse>): void {
        throw new Error("Function not implemented.");
    }
~~~

- Tenemos un servicio grpc del tipo streaming del lado del servidor que recibe como  objeto de petición el GetAllReuest y devuelve una EmployeeResponse (no un arreglo)
- Cada vez que mandemos un mensaje a través del streaming mandaremos un empleado que el cliente va a capturar en su conjunto como un arreglo
- call tiene unmetodo write que recibe un chunk de respuesta (de tipo EmployeeResponse)
- Hay que terminar la conexión

~~~js
getAll: function (call: ServerWritableStream<GetAllRequest__Output, EmployeeResponse>): void {
    const employees  = _employeesDB.getEmployees()
    employees.forEach(employee=>{
        call.write({employee})
    } )

    call.end()
    
}
~~~

- En la respuesta observo que cada empleado es un envío por parte del servidor,  en lugar de venir tdo en un arreglo
- La conexión durará hasta que el servidor considere que ha enviado toda la data
------

## Mensajes - Client Streaming

- Subiremos una foto con AddPhoto

~~~js
AddPhoto: function (call: ServerReadableStream<AddPhotoRequest__Output, AddPhotoResponse>, callback: sendUnaryData<AddPhotoResponse>): void {
    throw new Error("Function not implemented.");
}
~~~

- El servidor está recibiendo como parámetro de call un stream de lectura ServerReadableStream, por el que se nos va a enviar un chunk de información, en algún momento se va a detener ese envío de tipo AddPhotoRequest y devolver un dato unario de tipo AddPhotoResponse en el callback
- Por eso es streaming del lado del cliente, porque es este quien envía información hasta un momento determinado
-EmployeesService.ts

~~~js
AddPhoto: function (call: ServerReadableStream<AddPhotoRequest__Output, AddPhotoResponse>, callback: sendUnaryData<AddPhotoResponse>): void {
        //guardamos el stream en un archivo
        const writableStream  = fs.createWriteStream('upload_photo.png')

        //lo que hareos cada vez que lleguen datos
        call.on('data', (request:AddPhotoRequest)=>{ //si busco la interfaz de AddPhotoRequest contine data de tipo Buffer

            writableStream.write(request.data)
        })

        //lo que haremos cuando terminen de llegar esos datos
        call.on('end', ()=>{
            //guardará todos los bytes dentro de la ruta upload_photo
            writableStream.end()
            console.log("File uploaded successfully!!")
        })

    }
~~~

- Para el streaming del lado del cliente para una foto no puedo hacerlo con POSTMAN
- Crearé un cliente para ello con un script
------

## Mensajes - Bidireccional Streaming