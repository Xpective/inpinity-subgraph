import {
    AttackStarted as AttackStartedEvent,
    AttackExecuted as AttackExecutedEvent
  } from "../generated/PiratesV2/PiratesV2"
  import { Attack } from "../generated/schema"
  
  export function handleAttackStartedV2(event: AttackStartedEvent): void {
    let attack = new Attack(event.params.attackId.toString())
    attack.attacker = event.params.attacker
    attack.target = event.params.targetTokenId
    attack.startTime = event.block.timestamp
    attack.endTime = event.params.endTime
    attack.executed = false
    attack.save()
  }
  
  export function handleAttackExecutedV2(event: AttackExecutedEvent): void {
    let attack = Attack.load(event.params.attackId.toString())
    if (attack) {
      attack.executed = true
      attack.stolenAmount = event.params.stolenAmount
      attack.save()
    }
  }