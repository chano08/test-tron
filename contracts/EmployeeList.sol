pragma solidity ^0.4.23;

import "./EmployeeFactory.sol";

contract EmployeeList {

    address[] public employees;
    mapping (address => bool) public employeeExists;

    address public factory;
    
    modifier factoryOnly {
        assert(msg.sender == factory);
        _;
    }

    function setFactory(address _factory) public {
        factory = _factory;
    }

    function addEmployee(address _employee) factoryOnly public {
        employees.push(_employee);
        employeeExists[_employee] = true;
    }

    function getEmployees() public view returns (address[]) {
        return employees;
    }

}