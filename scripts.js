let TronWeb = require("tronweb");
let fs = require('fs');

let tronWeb = new TronWeb(
    "https://api.shasta.trongrid.io",
    "https://api.shasta.trongrid.io",
    "https://api.shasta.trongrid.io",
    "563375206ed3aac9583e860f7e4810cffd559cb7eafcd693f8b3fe70c7e336a5"
);


let EmployeeABI = require('./build/contracts/Employee.json').abi;

let Factory_addresses = require('./addresses/factoryAddress.json');
let List_addresses = require('./addresses/listAddress.json');


let test = async () => {

    try {

        let factory_instance = await tronWeb.contract().at(Factory_addresses[0]);
        let list_instance = await tronWeb.contract().at(List_addresses[0]);

        await factory_instance.methods.createEmployee("a", "b").send({feeLimit: 1000000000});

        let employees = await list_instance.methods.getEmployees().call();

        // TypeError: Cannot read property 'entrys' of undefined
        // let employee = await tronWeb.contract().at(employees[0].replace(/^(0x)/, '41'));

        // Failed to execute
        let employee = await tronWeb.contract(EmployeeABI, employees[0].replace(/^(0x)/, '41'));
        
        console.log(`name`, await employee.methods.name().call())
        console.log(`job`, await employee.methods.job().call())

    } catch( err ) {

        console.log(err);

    }

}


test()
    .then(() => {

        console.log('done...');

    })
    .catch(err => {

        console.log(err);

    })