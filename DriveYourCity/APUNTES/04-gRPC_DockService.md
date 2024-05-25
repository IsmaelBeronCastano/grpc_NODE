# 04 gRPC - Dock Service

- Dock es el dispositivo al que las bicis llegan y de las que son tomadas para realizar los viajes
- Esate servicio se va a conectar al balanceador de carga que le va a dar acceso a la DB que está dividida en 3 instancias
- En Dock.proto creamos los 4 servicios que usaremos
  - Crear un dock
  - Obtener todos los docks
  - Obtener un dock por id
  - Saber si el dock está disponible
- Vamos a hacer el scaffolding del proyecto
- Es algo que vamos a tener que hacer con cada uno de los microservicios
- Creo el directorio de dock-service
- Uso yarn init
- Instalo las dependencias de node

> npm i @grpc/grpc-js @grpc/proto-loader @prisma/client
> npm i --save-dev @types/google-protobuf grpc_tools_node_protoc_ts prisma ts-node typescript

- Creamos los scriptsç

~~~json
 "scripts": {
    "db:gen": "sh scripts/prisma-gen.sh", //generar la DB 
    "proto:gen": "sh scripts/proto-gen.sh", //generar los archivos de ts con las definiciones declaradas en proto   
    "start:server": "ts-node server.ts" //ejecutar el servidor
  }
~~~

- Creo la carpeta scripts
- Para crear el script para prisma creo prisma-gen.sh

~~~sh
# copio el schema 
cp -f ./../database/prisma/schema.prisma ./../dock-service/schema.prisma 
# genero el documento de node
npx prisma generate --schema ./schema.prisma
# remnuevo el documento para no generar basura
rm ./../dock-service/schema.prisma
~~~

- Creo proto-gen.sh

~~~sh
#!/bin/bash

PROTO_DIR=./../../proto  

# usamos la librería proto-loader para a travgés de la librería grpc generar todos los archivos que contengan .proto
yarn proto-loader-gen-types --grpcLib=@grpc/grpc-js --outDir=src/proto/ ./../proto/*.proto
~~~

- En node_modules/@prisma/client puedo ver todos los archivos ts y js generados
- Ahora ejecutamos **yarn run proto:gen**
- Esto genera todos los archivos con el código fuente dentro de la carpeta proto/DriveYourCity y los archivos Bike, Dock, Entities
- Creo .env con la URL de la DB (postgres, ya que cockroachDB usa postgres por debajo)

~~~
DATABASE_URL="postgresql://root@localhost:26000/driveyourcity?sslmode=disable"
~~~

- Crearemos src/persistence dónde almacenaremos toda la persistencia
- Creo src/services, donde crearemos la implementación de los servicios de grpc y otros servicios de apoyo que vamos a necesitar
- Creo la carpeta src/utils con código de utilidad
- Creo el server.ts en la raíz
- De momento lo hacemos inseguro

~~~js
// @ts-ignore
import path from 'path'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { ProtoGrpcType } from './src/proto/Dock';
import { DockService } from './src/service/DockService';

const PORT = 9081;
const DOCK_PROTO_FILE = './../proto/Dock.proto';

const dockPackageDef = protoLoader.loadSync(path.resolve(__dirname, DOCK_PROTO_FILE)); 
const dockGrpcObj = (grpc.loadPackageDefinition(dockPackageDef) as unknown) as ProtoGrpcType;

function main() {
    const server = getServer();    
    const serverCredentials = grpc.ServerCredentials.createInsecure();

    server.bindAsync(`0.0.0.0:${PORT}`, serverCredentials,
        (err, port) => {
            if (err) {
                console.error(err)
                return
            }
            console.log(`dock server as started on port ${port}`)
            server.start()
        })
}

function getServer() {
    const server = new grpc.Server();

    server.addService(dockGrpcObj.DriveYourCity.IDockService.service, new DockService())

    return server
}

main()
~~~ 

- Dentro de la carpeta utils creo el archivoi prisma.ts para la conexión
- Es un código genérico que se conecta a la instancia definidaq en la variable de entorno

~~~js
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

async function connectDB() {
  try {
    await prisma.$connect();
    console.log('? Database connected successfully');
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

export default connectDB;
~~~

- En utils creo también gRPC.ts para definir errores personalizados
- Para ello importo Status que es lo que nos ofrece la librería de grpc
- Si clico encima con ctrl puedo ver el archivo de definiciones constants.d.ts con todos los status disponibles

~~~js
export declare enum Status {
    OK = 0,
    CANCELLED = 1,
    UNKNOWN = 2,
    INVALID_ARGUMENT = 3,
    DEADLINE_EXCEEDED = 4,
    NOT_FOUND = 5,
    ALREADY_EXISTS = 6,
    PERMISSION_DENIED = 7,
    RESOURCE_EXHAUSTED = 8,
    FAILED_PRECONDITION = 9,
    ABORTED = 10,
    OUT_OF_RANGE = 11,
    UNIMPLEMENTED = 12,
    INTERNAL = 13,
    UNAVAILABLE = 14,
    DATA_LOSS = 15,
    UNAUTHENTICATED = 16
}
export declare enum LogVerbosity {
    DEBUG = 0,
    INFO = 1,
    ERROR = 2,
    NONE = 3
}
/**
 * NOTE: This enum is not currently used in any implemented API in this
 * library. It is included only for type parity with the other implementation.
 */
export declare enum Propagate {
    DEADLINE = 1,
    CENSUS_STATS_CONTEXT = 2,
    CENSUS_TRACING_CONTEXT = 4,
    CANCELLATION = 8,
    DEFAULTS = 65535
}
export declare const DEFAULT_MAX_SEND_MESSAGE_LENGTH = -1;
export declare const DEFAULT_MAX_RECEIVE_MESSAGE_LENGTH: number;
~~~

- Uso los que necesito en utils/gRPC.ts

~~~js
import { Status } from "@grpc/grpc-js/build/src/constants";

export const NotFoundError = (entity: string, id: number) => ({ code: Status.NOT_FOUND, message: `${entity} with id ${id} not found` });
//cuando nos invocan una función pero los argumentos no son insufcientes muestro este error
export const InvalidArgumentError = (args: string[]) => ({ code: Status.INVALID_ARGUMENT, message: `${args.join(', ')} missing arguments.` });
//error desconocido o no controlado
export const InternalError = (message: string) => ({ code: Status.INTERNAL, message });
~~~

- Este es el scaffolding completo del proyecto
- 