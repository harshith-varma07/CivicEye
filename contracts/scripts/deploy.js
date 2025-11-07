const hre = require("hardhat");

async function main() {
  console.log("Deploying CivicEye smart contracts to", hre.network.name);

  // Deploy IssueRegistry
  console.log("\nDeploying IssueRegistry...");
  const IssueRegistry = await hre.ethers.getContractFactory("IssueRegistry");
  const issueRegistry = await IssueRegistry.deploy();
  await issueRegistry.waitForDeployment();
  const issueRegistryAddress = await issueRegistry.getAddress();
  console.log("IssueRegistry deployed to:", issueRegistryAddress);

  // Deploy SLAContract
  console.log("\nDeploying SLAContract...");
  const SLAContract = await hre.ethers.getContractFactory("SLAContract");
  const slaContract = await SLAContract.deploy();
  await slaContract.waitForDeployment();
  const slaContractAddress = await slaContract.getAddress();
  console.log("SLAContract deployed to:", slaContractAddress);

  // Deploy CivicCredits
  console.log("\nDeploying CivicCredits...");
  const CivicCredits = await hre.ethers.getContractFactory("CivicCredits");
  const civicCredits = await CivicCredits.deploy();
  await civicCredits.waitForDeployment();
  const civicCreditsAddress = await civicCredits.getAddress();
  console.log("CivicCredits deployed to:", civicCreditsAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("IssueRegistry:", issueRegistryAddress);
  console.log("SLAContract:", slaContractAddress);
  console.log("CivicCredits:", civicCreditsAddress);
  console.log("\nSave these addresses to your .env file!");

  // Wait for block confirmations on testnets
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await issueRegistry.deploymentTransaction().wait(6);
    await slaContract.deploymentTransaction().wait(6);
    await civicCredits.deploymentTransaction().wait(6);
    console.log("Confirmed!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
