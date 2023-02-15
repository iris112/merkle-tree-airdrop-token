import { deployments, ethers, getNamedAccounts, getUnnamedAccounts } from 'hardhat';
import { makeSuite } from './helpers/make-suite';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import fs from 'fs';
import path from 'path';

const chai = require('chai');
const { expect } = chai;

makeSuite('MerkleAirdrop', () => {
  const TRANSFER_ROLE = 0;

  let merkleTree;
  let Airdrop;

  before('Setup', async () => {
    const { execute } = deployments;
    const { deployer } = await getNamedAccounts();
    Airdrop = (await deployments.get('MerkleAirdrop')).address;

    await execute(
      'STRDY',
      { from: deployer },
      'transfer',
      Airdrop,
      ethers.utils.parseUnits('200', 18)
    );
    await execute(
      'STRDY',
      { from: deployer },
      'setRoleCapability',
      TRANSFER_ROLE,
      '0xa9059cbb',
      true
    );
    await execute('STRDY', { from: deployer }, 'setUserRole', Airdrop, TRANSFER_ROLE, true);

    // Setup merkle tree
    merkleTree = StandardMerkleTree.load(
      JSON.parse(fs.readFileSync(path.join(__dirname, '../merkle.json')).toString())
    );
  });

  it('Check users pre-claim status', async () => {
    const { read } = deployments;
    const [, user1, user2] = await getUnnamedAccounts();

    expect(await read('STRDY', 'balanceOf', user1)).to.be.eq(0);
    expect(await read('STRDY', 'balanceOf', user2)).to.be.eq(0);
    expect(await read('STRDY', 'balanceOf', Airdrop)).to.be.eq(ethers.utils.parseUnits('200', 18));

    expect(await read('MerkleAirdrop', 'claimed', user1)).to.be.eq(false);
    expect(await read('MerkleAirdrop', 'claimed', user2)).to.be.eq(false);

    const user1amount = ethers.utils.parseUnits('10', 18).toString();
    const user1proof = merkleTree.getProof([user1, user1amount]);
    expect(await read('MerkleAirdrop', 'verifyClaim', user1, user1amount, user1proof)).to.be.eq(
      true
    );

    const user2amount = ethers.utils.parseUnits('100', 18).toString();
    const user2proof = merkleTree.getProof([user2, user2amount]);
    expect(await read('MerkleAirdrop', 'verifyClaim', user2, user2amount, user2proof)).to.be.eq(
      true
    );

    expect(
      await read(
        'MerkleAirdrop',
        'verifyClaim',
        user1,
        ethers.utils.parseUnits('11', 18),
        user1proof
      )
    ).to.be.eq(false);
    expect(
      await read(
        'MerkleAirdrop',
        'verifyClaim',
        user2,
        ethers.utils.parseUnits('101', 18),
        user2proof
      )
    ).to.be.eq(false);
    expect(await read('MerkleAirdrop', 'verifyClaim', user2, user1amount, user1proof)).to.be.eq(
      false
    );
    expect(await read('MerkleAirdrop', 'verifyClaim', user1, user2amount, user2proof)).to.be.eq(
      false
    );
  });

  it('Check users claim', async () => {
    const { read, execute } = deployments;
    const [, user1, user2] = await getUnnamedAccounts();
    const user1amount = ethers.utils.parseUnits('10', 18).toString();
    const user1proof = merkleTree.getProof([user1, user1amount]);
    const user2amount = ethers.utils.parseUnits('100', 18).toString();
    const user2proof = merkleTree.getProof([user2, user2amount]);

    // fail: wrong amount case
    await expect(
      execute(
        'MerkleAirdrop',
        { from: user1 },
        'claim',
        user1,
        ethers.utils.parseUnits('100', 18),
        user1proof
      )
    ).to.be.reverted;

    // fail: wrong user case
    await expect(execute('MerkleAirdrop', { from: user2 }, 'claim', user2, user1amount, user1proof))
      .to.be.reverted;

    // success: directly claim
    await expect(execute('MerkleAirdrop', { from: user1 }, 'claim', user1, user1amount, user1proof))
      .to.be.not.reverted;

    // success: indirectly claim
    await expect(execute('MerkleAirdrop', { from: user1 }, 'claim', user2, user2amount, user2proof))
      .to.be.not.reverted;

    // after-claim check state
    expect(await read('MerkleAirdrop', 'claimed', user1)).to.be.eq(true);
    expect(await read('MerkleAirdrop', 'claimed', user2)).to.be.eq(true);
    expect(await read('STRDY', 'balanceOf', user1)).to.be.eq(ethers.utils.parseUnits('10', 18));
    expect(await read('STRDY', 'balanceOf', user2)).to.be.eq(ethers.utils.parseUnits('100', 18));
    expect(await read('STRDY', 'balanceOf', Airdrop)).to.be.eq(ethers.utils.parseUnits('90', 18));

    // fail: double claim
    await expect(execute('MerkleAirdrop', { from: user1 }, 'claim', user1, user1amount, user1proof))
      .to.be.reverted;
  });
});
