const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  try {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Get deployment parameters from environment variables
    const contractType = process.env.CONTRACT_TYPE;
    const constructorArgs = JSON.parse(process.env.CONSTRUCTOR_ARGS || "[]");
    const shouldVerify = process.env.VERIFY === "true";
    const networkName = hre.network.name;

    console.log(`Deploying ${contractType} to ${networkName}`);
    console.log("Constructor args:", constructorArgs);

    // Get contract factory
    const ContractFactory = await hre.ethers.getContractFactory(contractType);
    
    // Deploy contract
    console.log("Deploying contract...");
    const contract = await ContractFactory.deploy(...constructorArgs);
    
    // Wait for deployment
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    console.log(`${contractType} deployed to:`, contractAddress);
    
    // Get deployment transaction
    const deploymentTx = contract.deploymentTransaction();
    const receipt = await deploymentTx.wait();
    
    console.log("Transaction hash:", deploymentTx.hash);
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Save deployment info
    const deploymentInfo = {
      contractType,
      contractAddress,
      transactionHash: deploymentTx.hash,
      gasUsed: receipt.gasUsed.toString(),
      network: networkName,
      chainId: hre.network.config.chainId,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      constructorArgs
    };
    
    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    // Save deployment info to file
    const deploymentFile = path.join(deploymentsDir, `${networkName}-${contractAddress}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    // Verify contract if requested
    if (shouldVerify && networkName !== "hardhat" && networkName !== "localhost") {
      console.log("Waiting for block confirmations...");
      await contract.deploymentTransaction().wait(5); // Wait for 5 confirmations
      
      console.log("Verifying contract...");
      try {
        await hre.run("verify:verify", {
          address: contractAddress,
          constructorArguments: constructorArgs,
        });
        console.log("Contract verified successfully");
        deploymentInfo.verified = true;
      } catch (error) {
        console.error("Verification failed:", error.message);
        deploymentInfo.verified = false;
        deploymentInfo.verificationError = error.message;
      }
      
      // Update deployment file with verification status
      fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    }
    
    // Return deployment result
    const result = {
      success: true,
      contractAddress,
      transactionHash: deploymentTx.hash,
      gasUsed: receipt.gasUsed.toString(),
      deploymentCost: (receipt.gasUsed * receipt.gasPrice).toString(),
      verified: deploymentInfo.verified || false
    };
    
    console.log("Deployment result:", JSON.stringify(result));
    return result;
    
  } catch (error) {
    console.error("Deployment failed:", error);
    const result = {
      success: false,
      error: error.message
    };
    console.log("Deployment result:", JSON.stringify(result));
    throw error;
  }
}

// Handle both direct execution and module export
if (require.main === module) {
  main()
    .then((result) => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} else {
  module.exports = main;
}