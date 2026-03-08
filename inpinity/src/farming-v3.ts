import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  FarmStarted,
  FarmStopped,
  BoostBought,
  ResourcesClaimed,
  ResourcesStolen
} from "../generated/FarmingV3/FarmingV3";

import { FarmV3, Boost, ResourceClaimed, ResourceStolen } from "../generated/schema";

function farmId(tokenId: BigInt): string {
  return tokenId.toString();
}

export function handleFarmStartedV3(event: FarmStarted): void {
  let id = farmId(event.params.tokenId);
  let farm = FarmV3.load(id);
  if (farm == null) {
    farm = new FarmV3(id);
  }

  farm.startTime = event.params.startTime;
  // in V3: lastAccrualTime wird on-chain gesetzt; Event liefert es nicht.
  // -> wir initialisieren auf startTime (sauber & logisch)
  farm.lastAccrualTime = event.params.startTime;
  farm.boostExpiry = BigInt.fromI32(0);
  farm.active = true;

  farm.save();
}

export function handleFarmStoppedV3(event: FarmStopped): void {
  let id = farmId(event.params.tokenId);
  let farm = FarmV3.load(id);
  if (farm == null) {
    farm = new FarmV3(id);
    farm.startTime = BigInt.fromI32(0);
    farm.lastAccrualTime = BigInt.fromI32(0);
    farm.boostExpiry = BigInt.fromI32(0);
  }

  farm.active = false;
  // Event hat "time" (stop time) – wir lassen lastAccrualTime auf "time"
  farm.lastAccrualTime = event.params.time;

  farm.save();
}

export function handleBoostBoughtV3(event: BoostBought): void {
  let b = new Boost(event.transaction.hash);
  b.tokenId = event.params.tokenId;
  b.daysAmount = event.params.daysAmount;
  b.cost = event.params.cost;
  b.newExpiry = event.params.newExpiry;
  b.buyer = event.transaction.from;

  b.blockNumber = event.block.number;
  b.blockTimestamp = event.block.timestamp;
  b.transactionHash = event.transaction.hash;

  b.save();

  // FarmV3 updaten (boostExpiry)
  let id = farmId(event.params.tokenId);
  let farm = FarmV3.load(id);
  if (farm == null) {
    farm = new FarmV3(id);
    farm.startTime = BigInt.fromI32(0);
    farm.lastAccrualTime = BigInt.fromI32(0);
    farm.active = true;
  }
  farm.boostExpiry = event.params.newExpiry;
  farm.save();
}

export function handleResourcesClaimedV3(event: ResourcesClaimed): void {
  // Optional: pro Resource ein ResourceClaimed Entity schreiben
  // Falls du das in V2 schon hast: ResourceClaimed existiert bei dir bereits.
  let tokenId = event.params.tokenId;
  let ids = event.params.resourceIds;
  let amounts = event.params.amounts;

  for (let i = 0; i < ids.length; i++) {
    let rc = new ResourceClaimed(event.transaction.hash.concatI32(i));
    rc.tokenId = tokenId;
    rc.resourceId = ids[i];
    rc.amount = amounts[i];
    rc.blockNumber = event.block.number;
    rc.blockTimestamp = event.block.timestamp;
    rc.transactionHash = event.transaction.hash;
    rc.save();
  }

  // Farm lastAccrualTime aktualisieren (Claim Zeitpunkt)
  let farm = FarmV3.load(tokenId.toString());
  if (farm != null) {
    farm.lastAccrualTime = event.block.timestamp;
    farm.save();
  }
}

export function handleResourcesStolenV3(event: ResourcesStolen): void {
  // Optional: pro steal ein ResourceStolen Entity schreiben (existiert bei dir bereits)
  let rs = new ResourceStolen(event.transaction.hash);
  rs.tokenId = event.params.targetTokenId;
  rs.thief = event.params.attacker;
  rs.resourceId = BigInt.fromI32(event.params.resourceId);
  rs.amount = event.params.amount;

  rs.blockNumber = event.block.number;
  rs.blockTimestamp = event.block.timestamp;
  rs.transactionHash = event.transaction.hash;
  rs.save();
}