pragma solidity ^0.4.23;

import "./Employee.sol";
import "./EmployeeList.sol";

contract EmployeeFactory {

    EmployeeList public list;
    
    function setList(EmployeeList _list) public {
        list = _list;
    }

    function createEmployee(string _name, string _job) public {
        Employee emp = new Employee(_name, _job);
        list.addEmployee(emp);
    }

}