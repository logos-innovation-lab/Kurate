#!/bin/bash

mkdir tmp

cp ./lib/boardwalk-contracts/out/MarketplaceList.sol/MarketplaceList.json ./tmp
cp ./lib/boardwalk-contracts/out/MarketplaceFactory.sol/MarketplaceFactory.json ./tmp
cp ./lib/boardwalk-contracts/out/Marketplace.sol/Marketplace.json ./tmp
cp ./lib/boardwalk-contracts/out/MintableERC20.sol/MintableERC20.json ./tmp
cp ./lib/boardwalk-contracts/out/ERC20.sol/ERC20.json ./tmp

npx typechain ./tmp/*.json --target ethers-v5 --out-dir src/abi --show-stack-traces

rm -rf tmp
