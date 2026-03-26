import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HumanRegistry } from "../target/types/human_registry";
import { assert } from "chai";
import { PublicKey, Keypair } from "@solana/web3.js";

describe("human-registry", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.HumanRegistry as Program<HumanRegistry>;
  const admin = provider.wallet as anchor.Wallet;

  let statePda: PublicKey;
  let userAccountPda: PublicKey;

  before(async () => {
    const [state] = PublicKey.findProgramAddressSync(
      [Buffer.from("state")],
      program.programId
    );
    statePda = state;
  });

  it("Initializes the registry", async () => {
    await program.methods
      .initialize(admin.publicKey)
      .accounts({
        state: statePda,
        admin: admin.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const state = await program.account.appState.fetch(statePda);
    assert.ok(state.admin.equals(admin.publicKey));
    assert.ok(state.authority.equals(admin.publicKey));
  });

  it("Verifies a human user", async () => {
    const user = Keypair.generate();
    const score = 85;
    const timestamp = new anchor.BN(Date.now() / 1000);
    const signature = Buffer.from("mock_signature_for_testing");

    const [userAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("human"), user.publicKey.toBuffer()],
      program.programId
    );
    userAccountPda = userAccount;

    await program.methods
      .verifyHuman(score, timestamp, signature)
      .accounts({
        userAccount: userAccountPda,
        authority: admin.publicKey,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin.payer])
      .rpc();

    const userAccountData = await program.account.humanAccount.fetch(userAccountPda);
    assert.ok(userAccountData.isVerified);
    assert.equal(userAccountData.score, score);
    assert.ok(userAccountData.verificationCount === 1);
  });

  it("Gets human status", async () => {
    const user = Keypair.generate();
    
    const [userAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("human"), user.publicKey.toBuffer()],
      program.programId
    );

    const status = await program.methods
      .getHumanStatus()
      .accounts({
        userAccount: userAccount,
        user: user.publicKey,
      })
      .view();

    assert.isObject(status);
    assert.property(status, "isVerified");
    assert.property(status, "score");
    assert.property(status, "lastVerified");
    assert.property(status, "verificationCount");
  });

  it("Rejects low score verification", async () => {
    const user = Keypair.generate();
    const score = 30;
    const timestamp = new anchor.BN(Date.now() / 1000);
    const signature = Buffer.from("mock_signature_for_testing");

    const [userAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("human"), user.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .verifyHuman(score, timestamp, signature)
        .accounts({
          userAccount: userAccount,
          authority: admin.publicKey,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([admin.payer])
        .rpc();
      
      assert.fail("Should have thrown error for low score");
    } catch (error) {
      assert.include(error.message, "ScoreTooLow");
    }
  });

  it("Updates authority", async () => {
    const newAuthority = Keypair.generate().publicKey;

    await program.methods
      .updateAuthority(newAuthority)
      .accounts({
        state: statePda,
        admin: admin.publicKey,
      })
      .rpc();

    const state = await program.account.appState.fetch(statePda);
    assert.ok(state.authority.equals(newAuthority));
  });

  it("Revokes verification", async () => {
    const user = Keypair.generate();
    const score = 85;
    const timestamp = new anchor.BN(Date.now() / 1000);
    const signature = Buffer.from("mock_signature_for_testing");

    const [userAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("human"), user.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .verifyHuman(score, timestamp, signature)
      .accounts({
        userAccount: userAccount,
        authority: admin.publicKey,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin.payer])
      .rpc();

    await program.methods
      .revokeVerification()
      .accounts({
        userAccount: userAccount,
        authority: admin.publicKey,
        user: user.publicKey,
      })
      .signers([admin.payer])
      .rpc();

    const userAccountData = await program.account.humanAccount.fetch(userAccount);
    assert.equal(userAccountData.isVerified, false);
    assert.equal(userAccountData.score, 0);
  });

  it("Enforces verification cooldown", async () => {
    const user = Keypair.generate();
    const score = 85;
    const timestamp = new anchor.BN(Date.now() / 1000);
    const signature = Buffer.from("mock_signature_for_testing");

    const [userAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("human"), user.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .verifyHuman(score, timestamp, signature)
      .accounts({
        userAccount: userAccount,
        authority: admin.publicKey,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin.payer])
      .rpc();

    try {
      await program.methods
        .verifyHuman(score, timestamp, signature)
        .accounts({
          userAccount: userAccount,
          authority: admin.publicKey,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([admin.payer])
        .rpc();
      
      assert.fail("Should have thrown error for too soon verification");
    } catch (error) {
      assert.include(error.message, "TooSoon");
    }
  });
});