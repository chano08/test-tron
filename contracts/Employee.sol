pragma solidity ^0.4.23;


contract Employee {

    string public name;
    string public job;

    constructor(string _name, string _job) public {
        name = _name;
        job = _job;
    }

}