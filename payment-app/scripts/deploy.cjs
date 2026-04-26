const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying CryptoPayment contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MATIC");

  const CryptoPayment = await ethers.getContractFactory("CryptoPayment");
  const contract = await CryptoPayment.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("CryptoPayment deployed to:", address);
  console.log("View on PolygonScan: https://amoy.polygonscan.com/address/" + address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });