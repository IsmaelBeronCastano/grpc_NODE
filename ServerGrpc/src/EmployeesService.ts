import { ServerReadableStream, sendUnaryData, ServerUnaryCall, ServerDuplexStream, ServerWritableStream } from "@grpc/grpc-js";
import { AddPhotoRequest, AddPhotoRequest__Output } from "../proto/employees/AddPhotoRequest";
import { AddPhotoResponse } from "../proto/employees/AddPhotoResponse";
import { EmployeeRequest, EmployeeRequest__Output } from "../proto/employees/EmployeeRequest";
import { EmployeeResponse } from "../proto/employees/EmployeeResponse";
import { GetAllRequest__Output } from "../proto/employees/GetAllRequest";
import { GetByBadgeNumberRequest, GetByBadgeNumberRequest__Output } from "../proto/employees/GetByBadgeNumberRequest";
import { IEmployeeServiceHandlers } from "../proto/employees/IEmployeeService";
import { EmployeesDB } from "./EmployeesDB";
import * as fs from 'fs'

//guión bajo para indicar que es un dato privado que no quiero exponer fuera de este archivo
const _employeesDB = new EmployeesDB()


const  EmployeesService : IEmployeeServiceHandlers={
    
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

    },

    GetByBadgeNumber: function (call: ServerUnaryCall<GetByBadgeNumberRequest__Output, EmployeeResponse>, callback: sendUnaryData<EmployeeResponse>): void {
        const request = call.request as GetByBadgeNumberRequest //lo casteo al objeto que necesito trabajar
        //si reviso os archivos generados, GetByBadgNumberReuest.ts tiene un badgeNumber
        
        if(request.badgeNumber){
            const badgeNumber = request.badgeNumber
            const employee = _employeesDB.getEmployeeBybadgeNumber(badgeNumber) 
                callback(null, {employee}) 
        }


        //si no hay employee volvemos a usar el callback para indicar el error
        callback({
            name: "badgeNumber is undefined",
            message:"invalid input"
        }, {employee: undefined})

    },

    Save: function (call: ServerUnaryCall<EmployeeRequest__Output, EmployeeResponse>, callback: sendUnaryData<EmployeeResponse>): void {
        const request = call.request as EmployeeRequest
        

        if(request.employee){
            const employee = request.employee
            _employeesDB.saveEmployee(employee)
            callback(null, {employee})
        }

        callback({
            name: "employee is missing",
            message:"no employee to save"
        }, null)
    },

    SaveAll: function (call: ServerDuplexStream<EmployeeRequest__Output, EmployeeResponse>): void {
        let count= 0
        
        call.on('data', (request: EmployeeRequest)=>{
            if(request.employee){
                const employee = request.employee
                _employeesDB.saveEmployee(employee)
                count ++
                call.write({employee})
            }
        })

        call.on('end', ()=>{
            console.log(`${count} employees saved`)
            call.end() //siempre cerrar la conexión!!!
        })
    },
    getAll: function (call: ServerWritableStream<GetAllRequest__Output, EmployeeResponse>): void {
        const employees  = _employeesDB.getEmployees()
        employees.forEach(employee=>{
            call.write({employee})
        } )

        call.end()
        
    }
}


export {
    EmployeesService
}