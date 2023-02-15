import fs from 'fs';
import path from 'path';
import { deployments, getNamedAccounts } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  console.log(`Deploying MerkleAirdrop to ${hre.network.name}. Hit ctrl + c to abort`);

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const configPath = path.join(__dirname, '../merkle.json');
  const STRDY = (await deployments.get('STRDY')).address;

  if (!fs.existsSync(configPath)) {
    hre.run('generateMerkletree');
  }

  // Read merkle data
  const merkleTree = StandardMerkleTree.load(JSON.parse(fs.readFileSync(configPath).toString()));

  await deploy('MerkleAirdrop', {
    contract: 'MerkleAirdrop',
    from: deployer,
    args: [STRDY, merkleTree.root],
    log: true,
  });
};

export default func;

func.skip = async (hre: HardhatRuntimeEnvironment) => {
  const shouldSkip = false;
  return shouldSkip ? true : false;
};

func.dependencies = ['Token'];
func.tags = ['MerkleAirdrop'];
