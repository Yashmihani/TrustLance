const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance    = await hre.ethers.provider.getBalance(deployer.address);
  const network    = await hre.ethers.provider.getNetwork();

  console.log("----------------------------------");
  console.log("Wallet:", deployer.address);
  console.log("Chain ID:", Number(network.chainId));
  console.log("Balance:", hre.ethers.formatEther(balance), "MATIC");
  console.log("----------------------------------");

  if (Number(network.chainId) === 80002) {
    console.log("Network: Polygon Amoy Testnet");
  } else if (Number(network.chainId) === 80001) {
    console.log("Network: Polygon Mumbai Testnet");
  } else if (Number(network.chainId) === 31337) {
    console.log("Network: Hardhat Local");
  } else {
    console.log("Network: Unknown -", Number(network.chainId));
  }

  if (balance === 0n) {
    console.log("No MATIC! Get some from:");
    console.log("https://faucet.polygon.technology");
    console.log("https://www.alchemy.com/faucets/polygon-amoy");
  } else {
    console.log("Ready to deploy!");
  }
}

main().catch(console.error);