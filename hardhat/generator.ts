import fs from "fs";
import path from "path";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { getAddress, parseUnits } from "ethers/lib/utils";

// Output file path
const outputPath: string = path.join(__dirname, "../merkle.json");

// Airdrop recipient addresses and scaled token values
type AirdropRecipient = string[];

export default class Generator {
  // Airdrop recipients
  recipients: AirdropRecipient[] = [];

  /**
   * Setup generator
   * @param {number} decimals of token
   * @param {Record<string, number>} airdrop address to token claim mapping
   */
  constructor(decimals: number, airdrop: Record<string, number>) {
    // For each airdrop entry
    for (const [address, amount] of Object.entries(airdrop)) {
      // Push:
      this.recipients.push([
        // Checksum address
        getAddress(address),
        // Scaled number of tokens claimable by recipient
        parseUnits(amount.toString(), decimals).toString()
      ]);
    }
  }

  async process(): Promise<void> {
    console.log("Generating Merkle tree.");

    // Generate merkle tree
    const merkleTree = StandardMerkleTree.of(this.recipients, ["address", "uint256"]);
    
    // Collect and log merkle root
    console.log(`Generated Merkle root: ${merkleTree.root}`);

    // Collect and save merkle tree + root
    await fs.writeFileSync(
      // Output to merkle.json
      outputPath,
      // Root + full tree
      JSON.stringify(merkleTree.dump())
    );
    console.log("Generated merkle tree and root saved to Merkle.json.");
  }
}