import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  FarmStarted as FarmStartedEvent,
  FarmStopped as FarmStoppedEvent,
  BoostBought as BoostBoughtEvent,
  ResourcesClaimed as ResourcesClaimedEvent,
  ResourcesStolen as ResourcesStolenEvent
} from "../generated/FarmingV4/FarmingV4";
import { 
  FarmV4, 
  FarmingBoostV4, 
  ClaimV4, 
  StealV4 
} from "../generated/schema";

export function handleFarmStartedV4(event: FarmStartedEvent): void {
  let farm = new FarmV4(event.params.tokenId.toString());
  farm.owner = event.params.owner;
  farm.startTime = event.params.startTime;
  farm.lastAccrualTime = event.params.startTime;
  farm.boostExpiry = BigInt.fromI32(0);
  farm.active = true;
  // WICHTIG: Block-Informationen setzen
  farm.blockNumber = event.block.number;
  farm.blockTimestamp = event.block.timestamp;
  farm.transactionHash = event.transaction.hash;
  farm.save();
}

export function handleFarmStoppedV4(event: FarmStoppedEvent): void {
  let farm = FarmV4.load(event.params.tokenId.toString());
  if (farm) {
    farm.active = false;
    farm.lastAccrualTime = event.params.stopTime;
    // Block-Informationen aktualisieren
    farm.blockNumber = event.block.number;
    farm.blockTimestamp = event.block.timestamp;
    farm.transactionHash = event.transaction.hash;
    farm.save();
  }
}

export function handleBoostBoughtV4(event: BoostBoughtEvent): void {
  let farm = FarmV4.load(event.params.tokenId.toString());
  if (farm) {
    farm.boostExpiry = event.params.newExpiry;
    farm.blockNumber = event.block.number;
    farm.blockTimestamp = event.block.timestamp;
    farm.transactionHash = event.transaction.hash;
    farm.save();
  }

  let boost = new FarmingBoostV4(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  boost.tokenId = event.params.tokenId;
  boost.owner = event.params.owner;
  boost.daysAmount = event.params.daysAmount;
  boost.cost = event.params.cost;
  boost.newExpiry = event.params.newExpiry;
  boost.blockNumber = event.block.number;
  boost.blockTimestamp = event.block.timestamp;
  boost.transactionHash = event.transaction.hash;
  boost.save();
}

export function handleResourcesClaimedV4(event: ResourcesClaimedEvent): void {
  let farm = FarmV4.load(event.params.tokenId.toString());
  if (farm) {
    farm.lastAccrualTime = event.block.timestamp;
    farm.blockNumber = event.block.number;
    farm.blockTimestamp = event.block.timestamp;
    farm.transactionHash = event.transaction.hash;
    farm.save();
  }

  let claim = new ClaimV4(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  claim.tokenId = event.params.tokenId;
  claim.owner = event.transaction.from;
  claim.resourceIds = event.params.resourceIds;
  claim.amounts = event.params.amounts;
  claim.blockNumber = event.block.number;
  claim.blockTimestamp = event.block.timestamp;
  claim.transactionHash = event.transaction.hash;
  claim.save();
}

export function handleResourcesStolenV4(event: ResourcesStolenEvent): void {
  let steal = new StealV4(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  steal.targetTokenId = event.params.targetTokenId;
  steal.attacker = event.params.attacker;
  steal.resourceId = event.params.resourceId;
  steal.amount = event.params.amount;
  steal.blockNumber = event.block.number;
  steal.blockTimestamp = event.block.timestamp;
  steal.transactionHash = event.transaction.hash;
  steal.save();
}