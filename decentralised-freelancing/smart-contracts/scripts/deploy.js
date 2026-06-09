// scripts/deploy.js
// Deploys EscrowFactory to the selected network

const hre = require('hardhat');

async function main() {
  console.log('🚀 Starting deployment...\n');

  // Get the deployer wallet
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📍 Deploying with address: ${deployer.address}`);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer balance: ${hre.ethers.formatEther(balance)} MATIC\n`);

  // Deploy EscrowFactory
  // Platform wallet = deployer for now (change in production)
  const platformWallet = deployer.address;
  const platformFee    = 5; // 5%

  console.log('📦 Deploying EscrowFactory...');
  const EscrowFactory = await hre.ethers.getContractFactory('EscrowFactory');
  const factory       = await EscrowFactory.deploy(platformWallet, platformFee);

  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log(`✅ EscrowFactory deployed to: ${factoryAddress}\n`);

  // Save addresses for frontend
  console.log('📋 Add these to your .env files:\n');
  console.log(`ESCROW_FACTORY_ADDRESS=${factoryAddress}`);
  console.log(`REACT_APP_ESCROW_FACTORY_ADDRESS=${factoryAddress}`);
  console.log(`REACT_APP_PLATFORM_WALLET=${platformWallet}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });