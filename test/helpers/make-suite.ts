import HRE from 'hardhat';
import bignumberChai from 'chai-bignumber';
import chai from 'chai';

chai.use(bignumberChai());

let buidlerevmSnapshotId: string = '0x1';
const setBuidlerevmSnapshotId = (id: string) => {
  buidlerevmSnapshotId = id;
};

export const evmSnapshot = async () => await HRE.ethers.provider.send('evm_snapshot', []);
export const evmRevert = async (id: string) => HRE.ethers.provider.send('evm_revert', [id]);

const setSnapshot = async () => {
  setBuidlerevmSnapshotId(await evmSnapshot());
};

const revertHead = async () => {
  await evmRevert(buidlerevmSnapshotId);
};

export function makeSuite(name: string, tests: () => void) {
  describe(name, () => {
    before(async () => {
      await setSnapshot();
    });
    tests();
    after(async () => {
      await revertHead();
    });
  });
}