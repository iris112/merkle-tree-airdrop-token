import { deployments, ethers, getNamedAccounts, getUnnamedAccounts } from 'hardhat';
import { makeSuite } from './helpers/make-suite';

const chai = require('chai');
const { expect } = chai;

makeSuite('Token', () => {
  const TRANSFER_ROLE = 0;
  const MINT_ROLE = 1;

  before('Setup', async () => {
    const { execute } = deployments;
    const { deployer } = await getNamedAccounts();

    await execute(
      'STRDY',
      { from: deployer },
      'setRoleCapability',
      TRANSFER_ROLE,
      '0xa9059cbb',
      true
    );
    await execute(
      'STRDY',
      { from: deployer },
      'setRoleCapability',
      TRANSFER_ROLE,
      '0x23b872dd',
      true
    );
    await execute('STRDY', { from: deployer }, 'setRoleCapability', MINT_ROLE, '0x40c10f19', true);
  });

  it('Check BasicParameterSettings and Owner permission', async () => {
    const { read, execute } = deployments;
    const { deployer } = await getNamedAccounts();
    const [, user1, user2] = await getUnnamedAccounts();

    expect(await read('STRDY', 'name')).to.be.eq('Sturdy Token');
    expect(await read('STRDY', 'symbol')).to.be.eq('STRDY');
    expect(await read('STRDY', 'decimals')).to.be.eq(18);
    expect(await read('STRDY', 'owner')).to.be.eq(deployer);
    expect(await read('STRDY', 'balanceOf', deployer)).to.be.eq(
      ethers.utils.parseUnits('100000000', 18)
    );

    await expect(execute('STRDY', { from: deployer }, 'mint', user1, 1)).to.be.not.reverted;
    await expect(execute('STRDY', { from: deployer }, 'transfer', user2, 1)).to.be.not.reverted;
  });

  it('Check Transfer', async () => {
    const { execute } = deployments;
    const { deployer } = await getNamedAccounts();
    const [user] = await getUnnamedAccounts();

    await execute('STRDY', { from: deployer }, 'mint', user, 1);
    await expect(execute('STRDY', { from: user }, 'transfer', deployer, 1)).to.be.revertedWith(
      'UNAUTHORIZED'
    );

    await execute('STRDY', { from: deployer }, 'setUserRole', user, TRANSFER_ROLE, true);
    await expect(execute('STRDY', { from: user }, 'transfer', deployer, 1)).to.be.not.reverted;

    await execute('STRDY', { from: deployer }, 'mint', user, 1);
    await execute('STRDY', { from: deployer }, 'setUserRole', user, TRANSFER_ROLE, false);
    await expect(execute('STRDY', { from: user }, 'transfer', deployer, 1)).to.be.revertedWith(
      'UNAUTHORIZED'
    );

    await execute('STRDY', { from: deployer }, 'setPublicCapability', '0xa9059cbb', true);
    await expect(execute('STRDY', { from: user }, 'transfer', deployer, 1)).to.be.not.reverted;
  });

  it('Check TransferFrom', async () => {
    const { execute } = deployments;
    const { deployer } = await getNamedAccounts();
    const [user] = await getUnnamedAccounts();

    await execute('STRDY', { from: deployer }, 'mint', user, 1);
    await execute('STRDY', { from: deployer }, 'approve', user, 1);
    await expect(
      execute('STRDY', { from: user }, 'transferFrom', deployer, user, 1)
    ).to.be.revertedWith('UNAUTHORIZED');

    await execute('STRDY', { from: deployer }, 'setUserRole', user, TRANSFER_ROLE, true);
    await expect(execute('STRDY', { from: user }, 'transferFrom', deployer, user, 1)).to.be.not
      .reverted;

    await execute('STRDY', { from: deployer }, 'mint', user, 1);
    await execute('STRDY', { from: deployer }, 'approve', user, 1);
    await execute('STRDY', { from: deployer }, 'setUserRole', user, TRANSFER_ROLE, false);
    await expect(
      execute('STRDY', { from: user }, 'transferFrom', deployer, user, 1)
    ).to.be.revertedWith('UNAUTHORIZED');

    await execute('STRDY', { from: deployer }, 'setPublicCapability', '0x23b872dd', true);
    await expect(execute('STRDY', { from: user }, 'transferFrom', deployer, user, 1)).to.be.not
      .reverted;
  });

  it('Check Mint', async () => {
    const { execute } = deployments;
    const { deployer } = await getNamedAccounts();
    const [user] = await getUnnamedAccounts();

    await expect(execute('STRDY', { from: user }, 'mint', user, 1)).to.be.revertedWith(
      'UNAUTHORIZED'
    );

    await execute('STRDY', { from: deployer }, 'setUserRole', user, MINT_ROLE, true);
    await expect(execute('STRDY', { from: user }, 'mint', user, 1)).to.be.not.reverted;
  });
});
