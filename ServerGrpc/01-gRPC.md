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

- Hemos creado .proto con la definición de mi entidad y lainterfaz de servicio, toca implementar esos servicios
-
