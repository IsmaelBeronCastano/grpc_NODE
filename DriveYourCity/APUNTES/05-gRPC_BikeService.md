# 05 gRPC Bike Service

- Bike se encarga no solo del CRUD de una bici, también de asociar o desasociar unabici a un dock
- Observemos Bike.proto

~~~proto
syntax = "proto3";

package DriveYourCity;

import "Entities.proto";

service IBikeService {
    rpc GetBikeById (GetBikeByIdRequest) returns (BikeResponse);
    rpc CreateBike (BikeRequest) returns (BikeResponse);
    rpc AttachBikeToDock (AttachBikeToDockRequest) returns (BikeResponse);
    rpc UnAttachBikeFromDock (UnAttachBikeFromDockRequest) returns (BikeResponse);
}

// Communication Entities - Requests
message GetBikeByIdRequest {
  int32 bikeId = 1;
}
message BikeRequest {
  Bike bike = 1;
}

message AttachBikeToDockRequest {
  int32 bikeId = 1;
  int32 dockId = 2;
  int32 totalKms = 3;
}

message UnAttachBikeFromDockRequest {
  int32 bikeId = 1;  
}

// Communication Entities - Responses
message BikeResponse {
  Bike bike = 1;
}
~~~

- BikeService no solo expone un servicio de gRPC a RideService, también consume DockService
- Vamos a crear el microservicio, también vamos a crear un cliente que se conecte al servicio anterior (DockService) para realizar algunas tareas
- Creamos la carpeta BikeService, hacemos todo el scaffolding hecho anteriormente en DockService
- Es recomendable tener un repositorio con todo el scaffolding para poder reproducir los microservicios sin tener que repetir una y otra vez el código
- Genero el código fuente y el cliente de prisma con prisma-gen.sh y proto-gen.sh
- Creo la carpeta src/persistence/BikePersistence
- Realizamos la misma operación, importamos prisma de /utils/prisma con la conexión y se la pasamos al constructor guardándola en un atributo privado 
- Para **crear una bici** necesitamos crear un input. Le paso el id que es lo que tengo
- Uso this._prisma.bike.create y en un objeto le paso en la data el input
- Para **retornar todas las bicis** uso findMany
- Para **obtener la bici por id** uso findFirst, colocando en el where el id e incluyendo el dock en include
- Retorno bike como Bike
- Para **actualizar la bici** guardo la bike como Prisma.BikeUpdateInput
- Si clico encima de BikeUpdateInput + ctrl obtengo esto
- index.d.ts

~~~js
export type BikeUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    totalKm?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dock?: DockUpdateOneWithoutBikesNestedInput //puede tener un dock 
    rides?: RideUpdateManyWithoutBikeNestedInput //puede tener un ride
  }
~~~

- Si clico encima de DockUpdateOneWithoutBikesNestedInput + ctrl obtengo esto
- Son todas las operaciones que puedo hacer con una relación

~~~js
 export type DockUpdateOneWithoutBikesNestedInput = {
    create?: XOR<DockCreateWithoutBikesInput, DockUncheckedCreateWithoutBikesInput>
    connectOrCreate?: DockCreateOrConnectWithoutBikesInput
    upsert?: DockUpsertWithoutBikesInput
    disconnect?: DockWhereInput | boolean
    delete?: DockWhereInput | boolean
    connect?: DockWhereUniqueInput
    update?: XOR<XOR<DockUpdateToOneWithWhereWithoutBikesInput, DockUpdateWithoutBikesInput>, DockUncheckedUpdateWithoutBikesInput>
  }
~~~

- En BikePersistence.ts, en update, si bike.dock existe quiero conectar mi bici a ese dock
- Si no existe, lo que quiero es desconectar mi bici del dock al que esté conectado 
- Para el update uso prisma.bike.update, pasándole el id a where, y pasándole el objeto data

~~~js
import { Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { Bike } from "../proto/DriveYourCity/Bike";

export interface IBikePersistence {
    createBike(bike: Bike): Promise<Bike>;
    getAllBikes(): Promise<Bike[]>
    getBikeById(id:number): Promise<Bike | undefined>
    updateBike(id: number, bike: Partial<Bike>): Promise<Bike | undefined>
}

export class CockroachDBBikePersistence implements IBikePersistence {

    private _prisma;

    constructor() {
        this._prisma = prisma;
    }

    async createBike(bike: Bike): Promise<Bike> {
        const input: Prisma.BikeCreateInput = {
            id: bike.id!,
        }
        const newBike = await this._prisma.bike.create({ data: input });
        return newBike;
    }

    async getAllBikes(): Promise<Bike[]> {
        return this._prisma.bike.findMany();        
    }

    async getBikeById(id: number): Promise<Bike | undefined> {
        const bike = await this._prisma.bike.findFirst({
            where: {
              id,
            },
            include: {
                dock: true,
            },
          });        
        return bike as Bike;
    }

    async updateBike(id: number, bike: Partial<Bike>): Promise<Bike | undefined> {
        const data: Prisma.BikeUpdateInput = bike as Prisma.BikeUpdateInput;
        if(bike.dock) {
            data.dock = { connect: { id: bike.dock?.id }};
        } else {
            data.dock = { disconnect: true};
        }                
        const updatedBike = await prisma.bike.update({
            where: { id },
            data
        });
        return updatedBike;
    }
}
~~~

- Ya tenemos la persistencia, podemos crear nuestro servicio
- Pero antes creemos el cliente que se conecta al dock
- En service creo DockClient.ts

~~~js
import path from 'path'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { ProtoGrpcType } from '../proto/Dock';

const PORT = 9081; //puerto del server de Dock
const DOCK_PROTO_FILE = './../../../proto/Dock.proto';

const dockPackageDef = protoLoader.loadSync(path.resolve(__dirname, DOCK_PROTO_FILE)); //creo la definición del paquete pasándole la ruta del proto
const dockGrpcObj = (grpc.loadPackageDefinition(dockPackageDef) as unknown) as ProtoGrpcType; //creo el objeto para crear la instancia del servicio

const channelCredentials = grpc.credentials.createInsecure(); //de momento inseguro
const dockServiceClient = new dockGrpcObj.DriveYourCity.IDockService(`0.0.0.0:${PORT}`, channelCredentials) //creo el servicio y lo mapeo al puerto   

const dockClient = {  //solo necesito interactuar con el Dock para saber si está disponible
    isDockAvailable: async (dockId: number): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            dockServiceClient.IsDockAvailable({dockId}, (err, response) => { //el servicio recibe el id (que recoge con el call.request) 
                                                                              //y el callback con el error de primer parámetro y la response de segundo
                if(response) {
                    resolve(response.isAvalable as boolean); // si hay response resolvemos la promesa devolviendo el isAvaliable como boolean   
                }
                reject(err); // si no hay respuesta usamos reject y devolvemnos el error
            });
        }) 
    }
}

export {
    dockClient
}
~~~

- Encapsula y divide muy bien las responsabilidades
- Vayamos con el BikeService

~~~js
import { ServerUnaryCall, handleUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { IBikeServiceHandlers } from "../proto/DriveYourCity/IBikeService";
import { BikeRequest__Output } from "../proto/DriveYourCity/BikeRequest";
import { BikeResponse } from "../proto/DriveYourCity/BikeResponse";
import { GetBikeByIdRequest__Output } from "../proto/DriveYourCity/GetBikeByIdRequest";
import { AttachBikeToDockRequest__Output } from "../proto/DriveYourCity/AttachBikeToDockRequest";
import { CockroachDBBikePersistence } from "../persitence/BikePersistence";
import { dockClient } from "./DockClient";
import { InternalError, InvalidArgumentError, NotFoundError } from "../utils/gRPC";
import { UnAttachBikeFromDockRequest__Output } from "../proto/DriveYourCity/UnAttachBikeFromDockRequest";

const bikePersistence = new CockroachDBBikePersistence();
class BikeService implements IBikeServiceHandlers {

    [name: string]: import("@grpc/grpc-js").UntypedHandleCall;
    
    async AttachBikeToDock(call: ServerUnaryCall<AttachBikeToDockRequest__Output, BikeResponse>, callback: sendUnaryData<BikeResponse>): Promise<void> {
        try {
            const bikeId = call.request.bikeId;
            const dockId = call.request.dockId;
            const totalKm = call.request.totalKms ? call.request.totalKms : 0;
    
            console.log('AttachBikeToDock', { bikeId, dockId, totalKm });
            if(bikeId && dockId) {            
                const isDockAvailable = await dockClient.isDockAvailable(dockId);
                const bike = await bikePersistence.getBikeById(bikeId);
                if(!isDockAvailable) {                                          
                    callback({ code: Status.FAILED_PRECONDITION, message: `dock with id ${dockId} not available` }, { bike: undefined });
                } else if(bike?.dock !== null) {
                    callback({ code: Status.FAILED_PRECONDITION, message: `bike with id ${bikeId} is attached to the dock ${bike?.dock?.id}` }, { bike: undefined });
                }else {
                    const updatedBike = await bikePersistence.updateBike(bikeId, { totalKm: bike?.totalKm! + totalKm!, dock: { id: dockId } });
                    callback(null, { bike: updatedBike });                    
                }
            } 
            callback(InvalidArgumentError(['dockId', 'bikeId']), { bike: undefined });
        } catch (err) {
            callback(InternalError(err as string), { bike: undefined });
        }        
    }

    async UnAttachBikeFromDock(call: ServerUnaryCall<UnAttachBikeFromDockRequest__Output, BikeResponse>, callback: sendUnaryData<BikeResponse>): Promise<void> {
        try {
            const bikeId = call.request.bikeId;

            console.log('UnAttachBikeFromDock', { bikeId });
            if(bikeId) {
                const bike = await bikePersistence.getBikeById(bikeId);
                if(bike?.dock !== null) {
                    const updatedBike = await bikePersistence.updateBike(bikeId, { dock: null });
                    callback(null, { bike: updatedBike });
                } else {
                    callback({ code: Status.FAILED_PRECONDITION, message: `bike with id ${bikeId} is not attached to any dock` }, { bike: undefined });
                }
            }            

        } catch (err) {
            callback(InternalError(err as string), { bike: undefined });
        }         
    }
    
    async CreateBike(call: ServerUnaryCall<BikeRequest__Output, BikeResponse>, callback: sendUnaryData<BikeResponse>): Promise<void> {
        try {
            const bike = call.request.bike;
            console.log('CreateBike', { bike });
            if(bike) {
                const newBike = await bikePersistence.createBike(bike);
                callback(null, { bike: newBike });
            }
        } catch (err) {
            callback(InternalError(err as string), { bike: undefined });
        }         
    }

    async GetBikeById(call: ServerUnaryCall<GetBikeByIdRequest__Output, BikeResponse>, callback: sendUnaryData<BikeResponse>): Promise<void> {
        try {
            const bikeId = call.request.bikeId;
            console.log('GetBikeById', { bikeId });
            if (bikeId) {            
                const bike = await bikePersistence.getBikeById(bikeId);                
                const error = bike ? null : NotFoundError('bike', bikeId);
                callback(error, { bike });
            }
        callback(InvalidArgumentError(['dockId']), { bike: undefined });
        } catch (err) {
            callback(InternalError(err as string), { bike: undefined });
        }        
    }
}

export {
    BikeService
}
~~~