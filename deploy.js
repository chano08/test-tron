let TronWeb = require("tronweb");
let fs = require('fs');

let deployedContracts = [];

let tronWeb = new TronWeb(
    "https://api.shasta.trongrid.io",
    "https://api.shasta.trongrid.io",
    "https://api.shasta.trongrid.io",
    "563375206ed3aac9583e860f7e4810cffd559cb7eafcd693f8b3fe70c7e336a5"
);

let walk = () => {
    let _dir = './build/contracts';
    let contracts = [];
    for (let file of fs.readdirSync(_dir)) {
        let json = require(`${_dir}/${file}`);
        contracts[json.contractName] = {
            abi: json.abi,
            bytecode: json.bytecode
        };
    }
    return contracts;
}

let doDeployContract = async info => {
    let contracts = walk();
    let args = [];
    for (let arg of info.arguments) {
        if (typeof arg !== 'function') {
            args.push(arg);
        } else {
            args.push(arg());
        }
    }
    console.log(`Deploying ${info.deployed}...`);
    let abi = contracts[info.contract].abi;
    let bytecode = contracts[info.contract].bytecode;

    let contractInstance = await tronWeb.contract().new({
        abi: abi,
        bytecode: bytecode,
        parameters: args
    })
    console.log(`   ${info.deployed}: ${contractInstance.address}`);
    return contractInstance;
}

let deployContracts = async _deployInfo => {
    for (let i = 0; i < _deployInfo.length; i++) {
        let info = _deployInfo[i];
        let contractInstance = await doDeployContract(info);
        deployedContracts[info.deployed] = contractInstance;
    }
}

let processTransactions = async _transactionInfo => {
    console.log('')
    console.log('')
    for (let i = 0; i < _transactionInfo.length; i++) {
        let info = _transactionInfo[i];
        let contractInstance = deployedContracts[info.deployed];
        let args = [];
        for (let arg of info.arguments) {
            if (typeof arg !== 'function') {
                args.push(arg);
            } else {
                args.push(arg());
            }
        }
        let method = info.function;
        let txid = await contractInstance.methods[method](...args).send({
            feeLimit: 100000000
        });
        console.log(`${info.deployed}.${method}: ${txid}`);
    }
}

let deployInfo = [
    {
        'contract': 'EmployeeFactory',
        'arguments': [],
        'deployed': 'EmployeeFactory'
    },
    {
        'contract': 'EmployeeList',
        'arguments': [],
        'deployed': 'EmployeeList'
    }
];

let transactionInfo = [
    {
        'deployed': 'EmployeeList',
        'function': 'setFactory',
        'arguments': [
            () => {
                return deployedContracts['EmployeeFactory'].address
            }
        ]
    },
    {
        'deployed': 'EmployeeFactory',
        'function': 'setList',
        'arguments': [
            () => {
                return deployedContracts['EmployeeList'].address
            }
        ]
    }
];


let deploy = async () => {
    if (!fs.existsSync('./addresses')) {
        await fs.mkdirSync('./addresses');
    }
    await deployContracts(deployInfo);
    await processTransactions(transactionInfo);
}


let updateJSON = (_path, _file, _value) => {
    var addresses = {}
    if (fs.existsSync(`${_path}/${_file}`)) {
        addresses = require(`${_path}/${_file}`);
        addresses[0] = _value;
    } else {
        addresses[0] = _value;
    }
    fs.writeFileSync(`${_path}/${_file}`, JSON.stringify(addresses));
}

deploy()
    .then(()=>{
        updateJSON('./addresses', 'listAddress.json', deployedContracts['EmployeeList'].address);
        updateJSON('./addresses', 'factoryAddress.json', deployedContracts['EmployeeFactory'].address);
        console.log('Deploy completed...');
    })
    .catch(e => {
        console.log(e)
    })