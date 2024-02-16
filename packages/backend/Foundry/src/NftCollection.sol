//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
// 50000000000000000
// 10000000000000000
// 1000000000000000000 1 ether
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTCollection is ERC721URIStorage {
    using Counters for Counters.Counter;
    uint256 public collectionId;
    Counters.Counter public _tokenIds;
    string public collectionURI;
    Counters.Counter private _itemsSold;
    mapping(address => bool) private userDataUpdated;
    address public owner;
    uint256 public collectionPrice;
    

    uint256 listingPrice = 0.001 ether;

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

    struct Offer {
        address offerOwner;
        uint256 offerPrice;
    }

    Offer[] public offers;

    mapping(address => bool) public isOfferAccepted;
    mapping(address => uint256) public addressToOfferPrice;
    mapping(address => uint256) public offerToOfferOwner;
    mapping(address => bool) public isOwnerCreatedOffer;
    

    function makeOffer(uint256 price) public  {
        if(isOwnerCreatedOffer[msg.sender] == true){
            offers[offerToOfferOwner[msg.sender]]= Offer(msg.sender,price);
        }else{


        offers.push(Offer(msg.sender, price));
        isOfferAccepted[msg.sender] = false;
        addressToOfferPrice[msg.sender] = price;
        offerToOfferOwner[msg.sender] = (offers.length)-1;
        isOwnerCreatedOffer[msg.sender] = true;
        }
    }

    function acceptOffer(address offerOwner) public {
        require(msg.sender == owner, "Only owner can call");
        collectionPrice = addressToOfferPrice[offerOwner];
        isOfferAccepted[offerOwner] = true;
        
        for(uint256 i=0;i<offers.length;i++){
            address ownerAddress = offers[i].offerOwner;
            isOwnerCreatedOffer[ownerAddress] = false;
            offerToOfferOwner[ownerAddress] = 0;
            
            addressToOfferPrice[ownerAddress] = 0;

        }


        while (offers.length > 0) {
            offers.pop();
        }
    }

    mapping(uint256 => ListedNft) public idToListedNft;

    constructor(
        string memory name,
        string memory symbol,
        string memory _collectionURI,
        uint256 _collectionPrice,
        address _owner,
        uint256 id
    ) ERC721(name, symbol) {
        owner = payable(_owner);
        collectionURI = _collectionURI;
        collectionId = id;
        collectionPrice = _collectionPrice;
        userDataUpdated[owner] = true;
        // collectionPrice = _collectionPrice;
    }

    function createToken(
        string memory tokenURI,
        uint256 price
    ) public payable returns (uint256) {
        require(msg.sender == owner,"Only Owner Can Create :)");
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

        // _transfer(msg.sender, address(this), tokenId);

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

    function calculateTotalPrice() public view returns (uint256) {
        uint256 currentTokenId = _tokenIds.current();
        uint256 totalPrice = 0;
        for (uint256 i = 1; i <= currentTokenId; i++) {
            uint256 price = idToListedNft[i].price;
            totalPrice += price;
        }
        return totalPrice;
    }

    function sellTheCollection() public payable {
        uint256 currentTokenId = _tokenIds.current();
        require(msg.value == collectionPrice, "totalPrice is not correct");

        userDataUpdated[owner] = false;
        for (uint256 i = 1; i <= currentTokenId; i++) {
            address seller = idToListedNft[i].seller;
            _transfer(seller, msg.sender, i);
            idToListedNft[i].seller = payable(msg.sender);
            approve(address(this), i);
        }
        payable(owner).transfer(msg.value);
        owner = payable(msg.sender);
        userDataUpdated[owner] = true;
        isOfferAccepted[msg.sender] = false;
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

        _transfer(seller, msg.sender, tokenId);

        approve(address(this), tokenId);

        // payable(owner).transfer(listingPrice);

        payable(seller).transfer(msg.value);
    }

    // GETTER FUNCTIONS

    function getListPrice() public view returns (uint256) {
        return listingPrice;
    }

    

    function getListedNftForId(
        uint256 tokenId
    ) public view returns (ListedNft memory) {
        return idToListedNft[tokenId];
    }

    

    function getuserDataUpdated(address user) public view returns (bool) {
        return userDataUpdated[user];
    }
    function getOffersLengths() public view returns(uint256){
        return offers.length;
    }
}
