//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMarketplace is ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    Counters.Counter private _itemsSold;
    address payable owner;

    uint256 listingPrice = 0.01 ether;

    struct ListedNft {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool currentlyListed;
    }

    event TokenListedSuccess(
        uint256 indexed tokenId,
        address owner,
        address seller,
        uint256 price,
        bool currentlyListed
    );

    mapping(uint256 => ListedNft) private idToListedNft;

    constructor() ERC721("NFTMarketplace", "NFTM") {
        owner = payable(msg.sender);
    }

    function updateListPrice(uint256 _listPrice) public payable {
        require(owner == msg.sender, "Only owner can update listing price");
        listingPrice = _listPrice;
    }

    function getListPrice() public view returns (uint256) {
        return listingPrice;
    }

    function getLatestidToListedNft() public view returns (ListedNft memory) {
        uint256 currentTokenId = _tokenIds.current();
        return idToListedNft[currentTokenId];
    }

    function getListedNftForId(uint256 tokenId)
        public
        view
        returns (ListedNft memory)
    {
        return idToListedNft[tokenId];
    }

    function getCurrentToken() public view returns (uint256) {
        return _tokenIds.current();
    }

    function createToken(string memory tokenURI, uint256 price)
        public
        payable
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);

        _setTokenURI(newTokenId, tokenURI);

        createListedNft(newTokenId, price);

        return newTokenId;
    }

    function createListedNft(uint256 tokenId, uint256 price) private {
        require(
            msg.value == listingPrice,
            "You did not send the correct listprice"
        );

        require(price > 0, "price cannot be negative");

        idToListedNft[tokenId] = ListedNft(
            tokenId,
            payable(address(this)),
            payable(msg.sender),
            price,
            true
        );

        _transfer(msg.sender, address(this), tokenId);

        emit TokenListedSuccess(
            tokenId,
            address(this),
            msg.sender,
            price,
            true
        );
    }

    function getAllNFTs() public view returns (ListedNft[] memory) {
        uint256 nftCount = _tokenIds.current();
        ListedNft[] memory tokens = new ListedNft[](nftCount);
        uint256 currentIndex = 0;
        uint256 currentId;

        for (uint256 i = 0; i < nftCount; i++) {
            currentId = i + 1;
            ListedNft storage currentItem = idToListedNft[currentId];
            tokens[currentIndex] = currentItem;
            currentIndex += 1;
        }

        return tokens;
    }

    function executeSale(uint256 tokenId) public payable {
        uint256 price = idToListedNft[tokenId].price;
        address seller = idToListedNft[tokenId].seller;
        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );
        require(msg.sender != seller, "You cannot buy your own nft");

        idToListedNft[tokenId].currentlyListed = true;
        idToListedNft[tokenId].seller = payable(msg.sender);
        _itemsSold.increment();

        _transfer(address(this), msg.sender, tokenId);

        approve(address(this), tokenId);

        payable(owner).transfer(listingPrice);

        payable(seller).transfer(msg.value);
    }
}