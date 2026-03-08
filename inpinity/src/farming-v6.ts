import {
    FarmStarted as FarmStartedEvent,
    FarmStopped as FarmStoppedEvent,
    FarmExpired as FarmExpiredEvent,
    BoostBought as BoostBoughtEvent,
    BoostPaymentSplit as BoostPaymentSplitEvent,
    ResourcesClaimed as ResourcesClaimedEvent,
    ResourcesStolen as ResourcesStolenEvent,
    FarmingV6 as FarmingV6Contract
  } from "../generated/FarmingV6/FarmingV6";
  
  import {
    FarmV6,
    FarmingBoostV6,
    ClaimV6,
    StealV6,
    FarmExpiredV6,
    BoostPaymentSplitV6
  } from "../generated/schema";
  
  import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts";
  
  function loadOrCreateFarm(tokenId: BigInt): FarmV6 {
    let id = tokenId.toString();
    let farm = FarmV6.load(id);
  
    if (farm == null) {
      farm = new FarmV6(id);
      farm.owner = null;
      farm.startTime = BigInt.zero();
      farm.lastAccrualTime = BigInt.zero();
      farm.lastClaimTime = BigInt.zero();
      farm.boostExpiry = BigInt.zero();
      farm.stopTime = BigInt.zero();
      farm.active = false;
      farm.activeUntil = BigInt.zero();
      farm.updatedAt = BigInt.zero();
      farm.blockNumber = BigInt.zero();
      farm.transactionHash = Bytes.empty();
    }
  
    return farm as FarmV6;
  }
  
  function refreshFarmState(
    contractAddress: Address,
    tokenId: BigInt,
    eventBlockTimestamp: BigInt,
    blockNumber: BigInt,
    txHash: Bytes
  ): void {
    let farm = loadOrCreateFarm(tokenId);
    let contract = FarmingV6Contract.bind(contractAddress);
  
    let stateCall = contract.try_getFarmState(tokenId);
    if (!stateCall.reverted) {
      let state = stateCall.value;
      farm.startTime = state.startTime;
      farm.lastAccrualTime = state.lastAccrualTime;
      farm.lastClaimTime = state.lastClaimTime;
      farm.boostExpiry = state.boostExpiry;
      farm.stopTime = state.stopTime;
      farm.active = state.isActive;
    }
  
    let activeUntilCall = contract.try_getFarmActiveUntil(tokenId);
    if (!activeUntilCall.reverted) {
      farm.activeUntil = activeUntilCall.value;
    }
  
    farm.updatedAt = eventBlockTimestamp;
    farm.blockNumber = blockNumber;
    farm.transactionHash = txHash;
    farm.save();
  }
  
  export function handleFarmStartedV6(event: FarmStartedEvent): void {
    let farm = loadOrCreateFarm(event.params.tokenId);
    farm.owner = event.params.owner;
    farm.startTime = event.params.startTime;
    farm.lastAccrualTime = event.params.startTime;
    farm.active = true;
    farm.updatedAt = event.block.timestamp;
    farm.blockNumber = event.block.number;
    farm.transactionHash = event.transaction.hash;
  
    let activeUntil = event.params.startTime.plus(BigInt.fromI32(7 * 24 * 60 * 60));
    farm.activeUntil = activeUntil;
  
    farm.save();
  
    refreshFarmState(
      event.address,
      event.params.tokenId,
      event.block.timestamp,
      event.block.number,
      event.transaction.hash
    );
  }
  
  export function handleFarmStoppedV6(event: FarmStoppedEvent): void {
    let farm = loadOrCreateFarm(event.params.tokenId);
    farm.stopTime = event.params.stopTime;
    farm.active = false;
    farm.updatedAt = event.block.timestamp;
    farm.blockNumber = event.block.number;
    farm.transactionHash = event.transaction.hash;
    farm.save();
  
    refreshFarmState(
      event.address,
      event.params.tokenId,
      event.block.timestamp,
      event.block.number,
      event.transaction.hash
    );
  }
  
  export function handleFarmExpiredV6(event: FarmExpiredEvent): void {
    let entity = new FarmExpiredV6(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.tokenId = event.params.tokenId;
    entity.expiredAt = event.params.expiredAt;
    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
  
    let farm = loadOrCreateFarm(event.params.tokenId);
    farm.active = false;
    farm.stopTime = event.params.expiredAt;
    farm.updatedAt = event.block.timestamp;
    farm.blockNumber = event.block.number;
    farm.transactionHash = event.transaction.hash;
    farm.save();
  
    refreshFarmState(
      event.address,
      event.params.tokenId,
      event.block.timestamp,
      event.block.number,
      event.transaction.hash
    );
  }
  
  export function handleBoostBoughtV6(event: BoostBoughtEvent): void {
    let entity = new FarmingBoostV6(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.tokenId = event.params.tokenId;
    entity.owner = event.params.owner;
    entity.daysAmount = event.params.daysAmount;
    entity.cost = event.params.cost;
    entity.newExpiry = event.params.newExpiry;
    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
  
    let farm = loadOrCreateFarm(event.params.tokenId);
    farm.owner = event.params.owner;
    farm.boostExpiry = event.params.newExpiry;
    farm.updatedAt = event.block.timestamp;
    farm.blockNumber = event.block.number;
    farm.transactionHash = event.transaction.hash;
    farm.save();
  
    refreshFarmState(
      event.address,
      event.params.tokenId,
      event.block.timestamp,
      event.block.number,
      event.transaction.hash
    );
  }
  
  export function handleBoostPaymentSplitV6(event: BoostPaymentSplitEvent): void {
    let entity = new BoostPaymentSplitV6(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.tokenId = event.params.tokenId;
    entity.payer = event.params.payer;
    entity.totalAmount = event.params.totalAmount;
    entity.treasuryAmount = event.params.treasuryAmount;
    entity.inpiPoolAmount = event.params.inpiPoolAmount;
    entity.pitronePoolAmount = event.params.pitronePoolAmount;
    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
  }
  
  export function handleResourcesClaimedV6(event: ResourcesClaimedEvent): void {
    let entity = new ClaimV6(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.tokenId = event.params.tokenId;
    entity.owner = event.params.owner;
    entity.resourceIds = event.params.resourceIds;
    entity.amounts = event.params.amounts;
    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
  
    refreshFarmState(
      event.address,
      event.params.tokenId,
      event.block.timestamp,
      event.block.number,
      event.transaction.hash
    );
  }
  
  export function handleResourcesStolenV6(event: ResourcesStolenEvent): void {
    let entity = new StealV6(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.targetTokenId = event.params.targetTokenId;
    entity.attacker = event.params.attacker;
    entity.resourceId = event.params.resourceId;
    entity.amount = event.params.amount;
    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
  
    refreshFarmState(
      event.address,
      event.params.targetTokenId,
      event.block.timestamp,
      event.block.number,
      event.transaction.hash
    );
  }