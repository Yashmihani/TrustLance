// test/Escrow.test.js
// Tests every function and edge case in the escrow contract

const { expect }       = require('chai');
const { ethers }       = require('hardhat');
const { parseEther, ZeroAddress } = ethers;

describe('Escrow Contract', function () {
  let escrow;
  let factory;
  let owner, client, freelancer, platform, other;

  // Deploy fresh contracts before each test
  beforeEach(async function () {
    [owner, client, freelancer, platform, other] = await ethers.getSigners();

    // Deploy factory
    const Factory = await ethers.getContractFactory('EscrowFactory');
    factory = await Factory.deploy(platform.address, 5); // 5% fee

    // Create an escrow via factory
    const deadline = Math.floor(Date.now() / 1000) + 86400; // 24hrs from now
    const tx = await factory
      .connect(client)
      .createEscrow(freelancer.address, 'project123', deadline);

    const receipt = await tx.wait();

    // Get the deployed escrow address from the event
    const event = receipt.logs.find(
      log => log.fragment?.name === 'EscrowCreated'
    );
    const escrowAddress = event.args[0];

    const Escrow = await ethers.getContractFactory('Escrow');
    escrow = Escrow.attach(escrowAddress);
  });

  // ── Deployment tests ──
  describe('Deployment', function () {
    it('sets client correctly', async function () {
      expect(await escrow.client()).to.equal(client.address);
    });

    it('sets freelancer correctly', async function () {
      expect(await escrow.freelancer()).to.equal(freelancer.address);
    });

    it('starts in AWAITING_PAYMENT status', async function () {
      expect(await escrow.status()).to.equal(0); // 0 = AWAITING_PAYMENT
    });
  });

  // ── Deposit tests ──
  describe('deposit()', function () {
    it('allows client to deposit MATIC', async function () {
      await escrow.connect(client).deposit({ value: parseEther('1.0') });
      expect(await escrow.status()).to.equal(1); // FUNDED
      expect(await escrow.amount()).to.equal(parseEther('1.0'));
    });

    it('rejects deposit from non-client', async function () {
      await expect(
        escrow.connect(other).deposit({ value: parseEther('1.0') })
      ).to.be.revertedWith('Only client can call this');
    });

    it('rejects zero deposit', async function () {
      await expect(
        escrow.connect(client).deposit({ value: 0 })
      ).to.be.revertedWith('Must deposit more than 0 MATIC');
    });
  });

  // ── Release payment tests ──
  describe('releasePayment()', function () {
    beforeEach(async function () {
      // Fund the escrow first
      await escrow.connect(client).deposit({ value: parseEther('1.0') });
    });

    it('releases payment to freelancer minus fee', async function () {
      const balanceBefore = await ethers.provider.getBalance(freelancer.address);
      await escrow.connect(client).releasePayment();

      const balanceAfter = await ethers.provider.getBalance(freelancer.address);
      // Freelancer gets 95% (5% fee deducted)
      expect(balanceAfter - balanceBefore).to.be.closeTo(
        parseEther('0.95'),
        parseEther('0.01') // allow for small gas variance
      );
    });

    it('sets status to COMPLETE', async function () {
      await escrow.connect(client).releasePayment();
      expect(await escrow.status()).to.equal(2); // COMPLETE
    });

    it('rejects release from non-client', async function () {
      await expect(
        escrow.connect(freelancer).releasePayment()
      ).to.be.revertedWith('Only client can call this');
    });
  });

  // ── Refund tests ──
  describe('refundClient()', function () {
    beforeEach(async function () {
      await escrow.connect(client).deposit({ value: parseEther('1.0') });
    });

    it('refunds full amount to client', async function () {
      const balanceBefore = await ethers.provider.getBalance(client.address);
      await escrow.connect(client).refundClient();
      const balanceAfter = await ethers.provider.getBalance(client.address);

      expect(balanceAfter).to.be.gt(balanceBefore);
      expect(await escrow.status()).to.equal(3); // REFUNDED
    });

    it('rejects refund from non-client', async function () {
      await expect(
        escrow.connect(other).refundClient()
      ).to.be.revertedWith('Only client can call this');
    });
  });

  // ── Dispute tests ──
  describe('disputeProject()', function () {
    beforeEach(async function () {
      await escrow.connect(client).deposit({ value: parseEther('1.0') });
    });

    it('allows client to raise dispute', async function () {
      await escrow.connect(client).disputeProject();
      expect(await escrow.status()).to.equal(4); // DISPUTED
    });

    it('allows freelancer to raise dispute', async function () {
      await escrow.connect(freelancer).disputeProject();
      expect(await escrow.status()).to.equal(4); // DISPUTED
    });

    it('rejects dispute from third party', async function () {
      await expect(
        escrow.connect(other).disputeProject()
      ).to.be.revertedWith('Only project parties can call this');
    });
  });

  // ── Dispute resolution tests ──
  describe('resolveDispute()', function () {
    beforeEach(async function () {
      await escrow.connect(client).deposit({ value: parseEther('1.0') });
      await escrow.connect(client).disputeProject();
    });

    it('platform can resolve in favor of freelancer', async function () {
      await escrow.connect(platform).resolveDispute(freelancer.address);
      expect(await escrow.status()).to.equal(2); // COMPLETE
    });

    it('platform can resolve in favor of client', async function () {
      await escrow.connect(platform).resolveDispute(client.address);
      expect(await escrow.status()).to.equal(3); // REFUNDED
    });

    it('rejects resolution from non-platform', async function () {
      await expect(
        escrow.connect(other).resolveDispute(freelancer.address)
      ).to.be.revertedWith('Only platform can call this');
    });
  });
});