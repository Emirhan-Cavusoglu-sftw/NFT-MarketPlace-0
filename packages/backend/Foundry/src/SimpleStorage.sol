// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */
contract SimpleStorage {

    string private name;
    string private symbol;

    constructor(string memory _name, string memory _symbol){
        name = _name;
        symbol = _symbol;
    }

    function returnName() public view returns (string memory){
        return name;
    }

    function returnSymbol() public view returns (string memory){
        return symbol;
    }
}