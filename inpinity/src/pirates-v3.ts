import { BigInt } from "@graphprotocol/graph-ts";
import { AttackStarted, AttackExecuted } from "../generated/PiratesV3/PiratesV3";
import { AttackV3 } from "../generated/schema";

function attackId(targetTokenId: BigInt, attackIndex: BigInt): string {
  return targetTokenId.toString() + "-" + attackIndex.toString();
}

export function handleAttackStartedV3(event: AttackStarted): void {
  let id = attackId(event.params.targetTokenId, event.params.attackIndex);
  let a = AttackV3.load(id);
  if (a == null) {
    a = new AttackV3(id);
  }

  a.attacker = event.params.attacker;
  a.attackerTokenId = event.params.attackerTokenId;
  a.target = event.params.targetTokenId;
  a.attackIndex = event.params.attackIndex;

  // StartTime nicht im Event? (bei dir im ABI: AttackStarted hat endTime + attackerTokenId + resource)
  // -> StartTime setzen wir auf block.timestamp (korrekt genug fürs UI)
  a.startTime = event.block.timestamp;
  a.endTime = event.params.endTime;

  a.resource = event.params.resource;
  a.executed = false;

  a.txHashStart = event.transaction.hash;

  a.save();
}

export function handleAttackExecutedV3(event: AttackExecuted): void {
  let id = attackId(event.params.targetTokenId, event.params.attackIndex);
  let a = AttackV3.load(id);
  if (a == null) {
    a = new AttackV3(id);
    a.attacker = event.params.attacker;
    a.attackerTokenId = BigInt.fromI32(0);
    a.target = event.params.targetTokenId;
    a.attackIndex = event.params.attackIndex;
    a.startTime = BigInt.fromI32(0);
    a.endTime = BigInt.fromI32(0);
    a.resource = event.params.resource;
  }

  a.executed = true;
  a.protectionLevel = event.params.protectionLevel;
  a.effectiveStealPercent = event.params.effectiveStealPercent;
  a.stolenAmount = event.params.stolenAmount;
  a.txHashExecute = event.transaction.hash;

  a.save();
}