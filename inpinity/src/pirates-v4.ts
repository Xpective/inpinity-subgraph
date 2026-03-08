import { Bytes } from "@graphprotocol/graph-ts";
import {
  AttackStarted as AttackStartedEvent,
  AttackExecuted as AttackExecutedEvent,
  PirateBoostBought as PirateBoostBoughtEvent
} from "../generated/PiratesV4/PiratesV4";
import { 
  AttackV4, 
  PirateBoostV4, 
  PirateBoostBoughtV4 
} from "../generated/schema";

export function handleAttackStartedV4(event: AttackStartedEvent): void {
  let id = event.params.targetTokenId.toString() + "-" + event.params.attackIndex.toString();
  let attack = new AttackV4(id);
  attack.attacker = event.params.attacker;
  attack.attackerTokenId = event.params.attackerTokenId;
  attack.targetTokenId = event.params.targetTokenId;
  attack.attackIndex = event.params.attackIndex;
  attack.startTime = event.params.startTime;
  attack.endTime = event.params.endTime;
  attack.resource = event.params.resource;
  attack.executed = false;
  attack.txHashStart = event.transaction.hash;
  attack.blockNumber = event.block.number;
  attack.blockTimestamp = event.block.timestamp;
  attack.transactionHash = event.transaction.hash;
  attack.save();
}

export function handleAttackExecutedV4(event: AttackExecutedEvent): void {
  let id = event.params.targetTokenId.toString() + "-" + event.params.attackIndex.toString();
  let attack = AttackV4.load(id);
  if (attack) {
    attack.executed = true;
    attack.protectionLevel = event.params.protectionLevel;
    attack.effectiveStealPercent = event.params.effectiveStealPercent;
    attack.stolenAmount = event.params.stolenAmount;
    attack.txHashExecute = event.transaction.hash;
    // Block-Felder bleiben erhalten, müssen nicht neu gesetzt werden
    attack.save();
  }
}

export function handlePirateBoostBoughtV4(event: PirateBoostBoughtEvent): void {
  let boost = PirateBoostV4.load(event.params.tokenId.toString());
  if (!boost) {
    boost = new PirateBoostV4(event.params.tokenId.toString());
    boost.owner = event.params.owner;
  }
  boost.expiry = event.params.newExpiry;
  // Block-Felder sind nicht Teil der PirateBoostV4-Entity? (Prüfen: Schema hat nur id, owner, expiry)
  // Falls doch, müssten sie hier gesetzt werden. Laut Schema hat PirateBoostV4 nur id, owner, expiry.
  // Also kein Problem.
  boost.save();

  let boostEvent = new PirateBoostBoughtV4(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  boostEvent.tokenId = event.params.tokenId;
  boostEvent.owner = event.params.owner;
  boostEvent.daysAmount = event.params.daysAmount;
  boostEvent.cost = event.params.cost;
  boostEvent.newExpiry = event.params.newExpiry;
  boostEvent.blockNumber = event.block.number;
  boostEvent.blockTimestamp = event.block.timestamp;
  boostEvent.transactionHash = event.transaction.hash;
  boostEvent.save();
}