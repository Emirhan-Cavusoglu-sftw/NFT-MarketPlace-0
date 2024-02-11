// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;


import "./SimpleStorage.sol";

/**
 * @title Owner
 * @dev Set & change owner
 */
contract Factory {

    SimpleStorage public simpleStorageContract;

    mapping(address=>address) public addressToNftCollection;

    function createSimpleStorageContract(string memory _name, string memory _symbol) public {
        simpleStorageContract = new Storage(_name, _symbol);
        addressToNftCollection[msg.sender] = address(simpleStorageContract);
    }

    function returnName() public view returns (string memory){
        return simpleStorageContract.returnName();
    }

    function returnSymbol() public view returns (string memory){
        return simpleStorageContract.returnSymbol();
    }

} 