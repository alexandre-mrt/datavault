// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DataMarketplace
 * @notice Marketplace for buying and selling datasets stored on 0G Storage.
 * @dev Sellers list datasets with root hashes, buyers pay to get access.
 *      5% marketplace fee on each sale. Supports subscriptions and one-time purchases.
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DataMarketplace is Ownable, ReentrancyGuard {
    uint256 public constant FEE_BPS = 500; // 5%
    uint256 public constant BPS = 10000;

    struct Dataset {
        address seller;
        string name;
        string description;
        string category;
        string rootHash; // 0G Storage root hash (encrypted)
        uint256 price; // one-time price in wei
        uint256 subscriptionPrice; // monthly subscription price (0 = no subscription)
        uint256 sales;
        bool active;
        uint256 createdAt;
    }

    struct Access {
        bool hasAccess;
        uint256 expiresAt; // 0 = perpetual
    }

    uint256 public nextDatasetId;
    uint256 public totalVolume;

    mapping(uint256 => Dataset) public datasets;
    mapping(uint256 => mapping(address => Access)) public access;
    mapping(address => uint256[]) public sellerDatasets;

    event DatasetListed(uint256 indexed id, address indexed seller, string name, uint256 price);
    event DatasetPurchased(uint256 indexed id, address indexed buyer, uint256 amount);
    event DatasetSubscribed(uint256 indexed id, address indexed subscriber, uint256 expiresAt);
    event DatasetDelisted(uint256 indexed id);

    constructor() Ownable(msg.sender) {}

    function listDataset(
        string memory name,
        string memory description,
        string memory category,
        string memory rootHash,
        uint256 price,
        uint256 subscriptionPrice
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(price > 0 || subscriptionPrice > 0, "Must set a price");

        uint256 id = nextDatasetId++;

        datasets[id] = Dataset({
            seller: msg.sender,
            name: name,
            description: description,
            category: category,
            rootHash: rootHash,
            price: price,
            subscriptionPrice: subscriptionPrice,
            sales: 0,
            active: true,
            createdAt: block.timestamp
        });

        sellerDatasets[msg.sender].push(id);

        emit DatasetListed(id, msg.sender, name, price);
        return id;
    }

    function purchase(uint256 datasetId) external payable nonReentrant {
        Dataset storage ds = datasets[datasetId];
        require(ds.active, "Not active");
        require(ds.price > 0, "No one-time price set");
        require(msg.value >= ds.price, "Insufficient payment");
        require(!access[datasetId][msg.sender].hasAccess, "Already purchased");

        uint256 fee = (ds.price * FEE_BPS) / BPS;
        uint256 sellerAmount = ds.price - fee;

        access[datasetId][msg.sender] = Access({ hasAccess: true, expiresAt: 0 });
        ds.sales++;
        totalVolume += ds.price;

        (bool sent, ) = payable(ds.seller).call{value: sellerAmount}("");
        require(sent, "Payment failed");

        if (msg.value > ds.price) {
            (bool refunded, ) = payable(msg.sender).call{value: msg.value - ds.price}("");
            require(refunded, "Refund failed");
        }

        emit DatasetPurchased(datasetId, msg.sender, ds.price);
    }

    function subscribe(uint256 datasetId) external payable nonReentrant {
        Dataset storage ds = datasets[datasetId];
        require(ds.active, "Not active");
        require(ds.subscriptionPrice > 0, "No subscription available");
        require(msg.value >= ds.subscriptionPrice, "Insufficient payment");

        uint256 fee = (ds.subscriptionPrice * FEE_BPS) / BPS;
        uint256 sellerAmount = ds.subscriptionPrice - fee;

        uint256 currentExpiry = access[datasetId][msg.sender].expiresAt;
        uint256 startFrom = currentExpiry > block.timestamp ? currentExpiry : block.timestamp;
        uint256 newExpiry = startFrom + 30 days;

        access[datasetId][msg.sender] = Access({ hasAccess: true, expiresAt: newExpiry });
        ds.sales++;
        totalVolume += ds.subscriptionPrice;

        (bool sent, ) = payable(ds.seller).call{value: sellerAmount}("");
        require(sent, "Payment failed");

        emit DatasetSubscribed(datasetId, msg.sender, newExpiry);
    }

    function hasAccess(uint256 datasetId, address user) external view returns (bool) {
        Access storage a = access[datasetId][user];
        if (!a.hasAccess) return false;
        if (a.expiresAt == 0) return true; // Perpetual
        return a.expiresAt > block.timestamp;
    }

    function delistDataset(uint256 datasetId) external {
        require(datasets[datasetId].seller == msg.sender, "Not seller");
        datasets[datasetId].active = false;
        emit DatasetDelisted(datasetId);
    }

    function withdrawFees() external onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "No fees");
        (bool sent, ) = payable(owner()).call{value: bal}("");
        require(sent, "Withdraw failed");
    }

    receive() external payable {}
}
