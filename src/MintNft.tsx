import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  Account,
  getMint,
  getAccount,
  createSetAuthorityInstruction,
  AuthorityType,
} from "@solana/spl-token";

// Special setup to add a Buffer class, because it's missing
window.Buffer = window.Buffer || require("buffer").Buffer;

function MintNft() {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  // Generate a new wallet keypair and airdrop SOL
  const fromWallet = Keypair.generate();
  // Public Key to your Phantom Wallet
  let fromTokenAccount: Account;
  let mint: PublicKey;

  async function createNft() {
    const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(fromAirdropSignature);

    // Create new token mint
    mint = await createMint(
      connection,
      fromWallet,
      fromWallet.publicKey,
      null,
      0 // 0 here means create token with 0 decimals which is standard nor NFTs
    );
    console.log(`Create NFT: ${mint.toBase58()}`);

    // Get the NFT account of the fromWallet address, and if it does not exist, create it
    fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, fromWallet.publicKey);
    console.log(`Create NFT Account: ${fromTokenAccount.address.toBase58()}`);
  }

  async function mintNft() {
    // Mint 1 new NFT to the "fromTokenAccount" account we just created
    const signature = await mintTo(connection, fromWallet, mint, fromTokenAccount.address, fromWallet.publicKey, 1);
    console.log(`Mint signature: ${signature}`);
  }

  async function lockNft() {
    let transaction = new Transaction().add(
      createSetAuthorityInstruction(mint, fromWallet.publicKey, AuthorityType.MintTokens, null)
    );
    const signature = await sendAndConfirmTransaction(connection, transaction, [fromWallet]);
    console.log(`Lock signature: ${signature}`);
  }

  return (
    <div>
      Mint NFT Section
      <div>
        <button onClick={createNft}>Create NFT</button>
        <button onClick={mintNft}>Mint NFT</button>
        <button onClick={lockNft}>Lock NFT</button>
      </div>
    </div>
  );
}


export default MintNft;
