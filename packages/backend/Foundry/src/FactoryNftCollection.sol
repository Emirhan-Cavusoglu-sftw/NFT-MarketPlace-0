// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {NFTCollection} from "./NftCollection.sol";

contract StorageFactory {
    mapping(uint256 => mapping(address => address))
        public addressToNftCollections;
    NFTCollection[] public listOfNFTCollectionContracts;

    uint256 public numberOfCreatedCollection = 0;
    mapping(address => uint256) public numberOfCreatedCollectionPerUser;
    mapping(uint256 => address) public collectionIdToUser;
    mapping(uint256 => address) public collectionIdToAddress;

    function createNFTCollectionContract(
        string memory _name,
        string memory _symbol,
        string memory _tokenURI,
        address owner
    ) public {
        NFTCollection nftCollectionContractVariable = new NFTCollection(
            _name,
            _symbol,
            _tokenURI,
            owner,
            numberOfCreatedCollection
        );
        collectionIdToUser[numberOfCreatedCollection] = msg.sender;

        listOfNFTCollectionContracts.push(nftCollectionContractVariable);

        collectionIdToAddress[numberOfCreatedCollection] = address(
            nftCollectionContractVariable
        );
        addressToNftCollections[numberOfCreatedCollection][
            msg.sender
        ] = address(nftCollectionContractVariable);
        numberOfCreatedCollectionPerUser[msg.sender]++;
        numberOfCreatedCollection++;
    }

    function updateUserData(uint256 id) public {
        address user = collectionIdToUser[id];
        numberOfCreatedCollectionPerUser[user]--;
        numberOfCreatedCollectionPerUser[msg.sender]++;
        addressToNftCollections[id][msg.sender] = collectionIdToAddress[id];
        addressToNftCollections[id][user] = address(0);
    }

    function getUserCollection() public view returns (address[] memory) {
        uint256 j = 0;
        address[] memory userNftCollectionArray = new address[](
            numberOfCreatedCollection
        );
        for (uint256 i = 0; i <= numberOfCreatedCollection; i++) {
            address userNftCollection = addressToNftCollections[i][msg.sender];

            if (userNftCollection == address(0)) {} else {
                userNftCollectionArray[j] = userNftCollection;
                j++;
            }
        }

        return userNftCollectionArray;
    }
}
