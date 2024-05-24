import * as protoLoader from "@grpc/proto-loader"
import * as grpc from "@grpc/grpc-js"
import path from 'path'
import {ProtoGrpcType} from './proto/employees'
import { Employee } from "./proto/employees/Employee"
import {Empty} from 'google-protobuf/google/protobuf/empty_pb'
import fs from 'fs'
import { SSLService } from "./src/SSLService"

const PORT = 8082

const PROTO_FILE="./proto/employees.proto"


const packageDefinition = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE)) //importamos el archivo proto


const grpcObj= (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType

//haremos que el server funcione de momento con las credenciales inseguras
//lo modifico en server.ts tambien, luego lo cambio
const channelCredentials= SSLService.getChannelCredentials()
const client=new grpcObj.employees.IEmployeeService(`0.0.0.0:${PORT}`, channelCredentials) //el cliente apunta a la interfaz del servicio.
                                                                                            //dispongo  de todos los métodos

//creamos la conexión del cliente
//ncesitamos  undeadLine, un tiempo  de espera para que el cliente se conecte (5-10 segundos)
const deadLine= new Date()
deadLine.setSeconds(deadLine.getSeconds()+10) //le añado 10 segundos

//esperamos a que el cliente este listo para conectarse
client.waitForReady(deadLine, (err)=>{
    if(err){
        throw new Error('Error creating Client')
        
    }
    onClientReady()
})

const getEmployeeByBadgeNumber = ()=>{
    client.getByBadgeNumber({badgeNumber: 2010}, (err, response)=>{
        if(err){
            console.error(err)
            return
        }
        console.log(`Employee: with badgeNumber ${response?.employee?.badgeNumber} has name ${response?.employee?.firstName}`)
    
    })
}

const saveEmployee= ()=>{
    const employee:  Employee ={
        id: 200,
        badgeNumber: 2025,
        firstName: 'Johnna',
        lastName: 'Scofieldy',
        vacationAccrualRate: 22,
        vacationAccrued: 10
      
    }

    client.save({employee}, (err, response)=>{
        if(err){
            console.error(err)
            return
        }
        console.log(`Employee saved with badgeNumber: ${response?.employee?.badgeNumber}`)
    })

}

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