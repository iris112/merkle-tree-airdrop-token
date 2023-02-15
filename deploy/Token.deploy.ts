import { deployments, getNamedAccounts } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  console.log(
    `Deploying Token to ${hre.network.name}. Hit ctrl + c to abort`
  );

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("STRDY", {
    contract: "Token",
    from: deployer,
    args: ['Sturdy Token', 'STRDY', 18, deployer],
    log: true
  });
};

export default func;

func.skip = async (hre: HardhatRuntimeEnvironment) => {
  const shouldSkip = false;
  return shouldSkip ? true : false;
};

func.tags = ["Token"];
