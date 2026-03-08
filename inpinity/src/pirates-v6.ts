import {
    AttackStarted as AttackStartedEvent,
    AttackExecuted as AttackExecutedEvent,
    AttackCancelled as AttackCancelledEvent,
    PirateBoostBought as PirateBoostBoughtEvent,
    PoolSharesUpdated as PoolSharesUpdatedEvent,
    RoundUpToMinimumOneUpdated as RoundUpToMinimumOneUpdatedEvent,
    PiratesV6 as PiratesV6Contract
  } from "../generated/PiratesV6/PiratesV6";
  
  import {
    AttackV6,
    PirateBoostV6,
    PirateBoostBoughtV6,
    PoolSharesV6,
    RoundUpConfigV6
  } from "../generated/schema";
  
  import { BigInt, Bytes } from "@graphprotocol/graph-ts";
  
  function attackEntityId(targetTokenId: BigInt, attackIndex: BigInt): string {
    return targetTokenId.toString() + "-" + attackIndex.toString();
  }
  
  export function handleAttackStartedV6(event: AttackStartedEvent): void {
    let id = attackEntityId(event.params.targetTokenId, event.params.attackIndex);
    let entity = new AttackV6(id);
  
    entity.attacker = event.params.attacker;
    entity.attackerTokenId = event.params.attackerTokenId;
    entity.targetTokenId = event.params.targetTokenId;
    entity.attackIndex = event.params.attackIndex;
    entity.resource = event.params.resource;
    entity.startTime = event.params.startTime;
    entity.endTime = event.params.endTime;
    entity.executed = false;
    entity.cancelled = false;
    entity.protectionLevel = null;
    entity.effectiveStealPercent = null;
    entity.stolenAmount = null;
    entity.txHashStart = event.transaction.hash;
    entity.txHashExecute = null;
    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
  }
  
  export function handleAttackExecutedV6(event: AttackExecutedEvent): void {
    let id = attackEntityId(event.params.targetTokenId, event.params.attackIndex);
    let entity = AttackV6.load(id);
  
    if (entity == null) {
      entity = new AttackV6(id);
      entity.attacker = event.params.attacker;
      entity.attackerTokenId = BigInt.zero();
      entity.targetTokenId = event.params.targetTokenId;
      entity.attackIndex = event.params.attackIndex;
      entity.resource = event.params.resource;
      entity.startTime = BigInt.zero();
      entity.endTime = BigInt.zero();
      entity.executed = false;
      entity.cancelled = false;
      entity.txHashStart = null;
    }
  
    entity.executed = true;
    entity.resource = event.params.resource;
    entity.protectionLevel = event.params.protectionLevel;
    entity.effectiveStealPercent = event.params.effectiveStealPercent;
    entity.stolenAmount = event.params.stolenAmount;
    entity.txHashExecute = event.transaction.hash;
    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
  }
  
  export function handleAttackCancelledV6(event: AttackCancelledEvent): void {
    let id = attackEntityId(event.params.targetTokenId, event.params.attackIndex);
    let entity = AttackV6.load(id);
  
    if (entity != null) {
      entity.cancelled = true;
      entity.blockNumber = event.block.number;
      entity.blockTimestamp = event.block.timestamp;
      entity.transactionHash = event.transaction.hash;
      entity.save();
    }
  }
  
  export function handlePirateBoostBoughtV6(event: PirateBoostBoughtEvent): void {
    let entity = new PirateBoostBoughtV6(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.tokenId = event.params.tokenId;
    entity.owner = event.params.owner;
    entity.daysAmount = event.params.daysAmount;
    entity.totalCost = event.params.totalCost;
    entity.newExpiry = event.params.newExpiry;
    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
  
    let boost = new PirateBoostV6(event.params.tokenId.toString());
    boost.owner = event.params.owner;
    boost.expiry = event.params.newExpiry;
    boost.updatedAt = event.block.timestamp;
    boost.save();
  }
  
  export function handlePoolSharesUpdatedV6(event: PoolSharesUpdatedEvent): void {
    let entity = new PoolSharesV6("current");
    entity.pitronePoolShare = event.params.pitronePoolShare;
    entity.inpiPoolShare = event.params.inpiPoolShare;
    entity.treasuryShare = event.params.treasuryShare;
    entity.updatedAt = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
  }
  
  export function handleRoundUpToMinimumOneUpdatedV6(event: RoundUpToMinimumOneUpdatedEvent): void {
    let entity = new RoundUpConfigV6("current");
    entity.enabled = event.params.enabled;
    entity.updatedAt = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
  }