import {
    AttackStarted as AttackStartedEvent,
    AttackExecuted as AttackExecutedEvent
  } from "../generated/PiratesV1/PiratesV1"
  import { Attack } from "../generated/schema"
  
  export function handleAttackStarted(event: AttackStartedEvent): void {
    let attackId = event.params.attackId.toString()
    let attack = new Attack(attackId)
    attack.attacker = event.params.attacker
    attack.target = event.params.targetTokenId
    attack.startTime = event.block.timestamp
    attack.endTime = event.params.endTime
    attack.executed = false
    attack.save()
  }
  
  export function handleAttackExecuted(event: AttackExecutedEvent): void {
    let attackId = event.params.attackId.toString()
    let attack = Attack.load(attackId)
    if (attack) {
      attack.executed = true
      attack.stolenAmount = event.params.stolenAmount
      attack.save()
    }
  }