import { BigInt } from "@graphprotocol/graph-ts"

import {
  AttackStarted,
  AttackExecuted,
  PirateBoostBought
} from "../generated/PiratesV5/PiratesV5"

import {
  AttackV5,
  PirateBoostV5,
  PirateBoostBoughtV5
} from "../generated/schema"

function attackId(targetTokenId: BigInt, attackIndex: BigInt): string {
  return targetTokenId.toString() + "-" + attackIndex.toString()
}

export function handleAttackStartedV5(event: AttackStarted): void {
  let id = attackId(event.params.targetTokenId, event.params.attackIndex)
  let entity = new AttackV5(id)

  entity.attacker = event.params.attacker
  entity.attackerTokenId = event.params.attackerTokenId
  entity.targetTokenId = event.params.targetTokenId
  entity.attackIndex = event.params.attackIndex
  entity.resource = event.params.resource
  entity.startTime = event.params.startTime
  entity.endTime = event.params.endTime
  entity.executed = false
  entity.cancelled = false
  entity.txHashStart = event.transaction.hash
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

export function handleAttackExecutedV5(event: AttackExecuted): void {
  let id = attackId(event.params.targetTokenId, event.params.attackIndex)
  let entity = AttackV5.load(id)

  if (entity == null) {
    entity = new AttackV5(id)
    entity.attacker = event.params.attacker
    entity.attackerTokenId = BigInt.fromI32(0)
    entity.targetTokenId = event.params.targetTokenId
    entity.attackIndex = event.params.attackIndex
    entity.resource = event.params.resource
    entity.startTime = BigInt.fromI32(0)
    entity.endTime = BigInt.fromI32(0)
    entity.executed = false
    entity.cancelled = false
  }

  entity.executed = true
  entity.protectionLevel = event.params.protectionLevel
  entity.effectiveStealPercent = event.params.effectiveStealPercent
  entity.stolenAmount = event.params.stolenAmount
  entity.txHashExecute = event.transaction.hash
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

export function handlePirateBoostBoughtV5(event: PirateBoostBought): void {
  let bought = new PirateBoostBoughtV5(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  bought.tokenId = event.params.tokenId
  bought.owner = event.params.owner
  bought.daysAmount = event.params.daysAmount
  bought.cost = event.params.cost
  bought.newExpiry = event.params.newExpiry
  bought.blockNumber = event.block.number
  bought.blockTimestamp = event.block.timestamp
  bought.transactionHash = event.transaction.hash
  bought.save()

  let id = event.params.tokenId.toString()
  let boost = PirateBoostV5.load(id)

  if (boost == null) {
    boost = new PirateBoostV5(id)
  }

  boost.owner = event.params.owner
  boost.expiry = event.params.newExpiry
  boost.updatedAt = event.block.timestamp
  boost.save()
}