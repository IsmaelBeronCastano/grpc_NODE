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