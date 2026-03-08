import { BigInt } from "@graphprotocol/graph-ts";
import {
  AttackStarted as AttackStartedEvent,
  AttackExecuted as AttackExecutedEvent
} from "../generated/PiratesV2/PiratesV2";
import { Attack, TargetAttackCounter } from "../generated/schema";

export function handleAttackStartedV2(event: AttackStartedEvent): void {
  // Attack-Objekt anlegen (ID = attackId)
  let attack = new Attack(event.params.attackId.toString());

  // Ziel-TokenID als String für den Counter
  let targetId = event.params.targetTokenId.toString();

  // Counter für dieses Ziel holen oder neu anlegen
  let counter = TargetAttackCounter.load(targetId);
  if (!counter) {
    counter = new TargetAttackCounter(targetId);
    counter.count = BigInt.fromI32(0);
  }

  // Der aktuelle Zählerstand ist der Index für diesen neuen Angriff
  let attackIndex = counter.count;

  attack.attacker = event.params.attacker;
  attack.target = event.params.targetTokenId;
  attack.attackIndex = attackIndex;          // Index speichern
  attack.startTime = event.block.timestamp;
  attack.endTime = event.params.endTime;
  attack.executed = false;
  attack.stolenAmount = null;

  attack.save();

  // Counter erhöhen für den nächsten Angriff auf dieses Ziel
  counter.count = counter.count.plus(BigInt.fromI32(1));
  counter.save();
}

export function handleAttackExecutedV2(event: AttackExecutedEvent): void {
  let attack = Attack.load(event.params.attackId.toString());
  if (attack) {
    attack.executed = true;
    attack.stolenAmount = event.params.stolenAmount;
    attack.save();
  }
}