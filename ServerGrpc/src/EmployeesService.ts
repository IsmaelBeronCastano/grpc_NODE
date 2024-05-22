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