import { task } from 'hardhat/config';
import { exit } from 'process';
import config from "../../.config.json";
import Generator from '../generator';

task('generateMerkletree', 'Generate merkle tree.')
  .setAction(async ({}, {}) => {
    try {
      
      // Collect config
      const decimals: number = config.decimals ?? 18;
      const airdrop: Record<string, number> = config.airdrop;

      // Initialize and call generator
      const generator = new Generator(decimals, airdrop);
      await generator.process();

    } catch (err) {
      console.error(err);
      exit(1);
    }
  });
