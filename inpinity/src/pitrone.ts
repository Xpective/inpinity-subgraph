import {
  Transfer as TransferEvent,
  Approval as ApprovalEvent,
  Exchanged as ExchangedEvent
} from "../generated/Pitrone/Pitrone"
import { PitroneTransfer, PitroneApproval, PitroneExchange } from "../generated/schema"

export function handlePitroneTransfer(event: TransferEvent): void {
  let entity = new PitroneTransfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.value = event.params.value
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

export function handlePitroneApproval(event: ApprovalEvent): void {
  let entity = new PitroneApproval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.spender = event.params.spender
  entity.value = event.params.value
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

export function handlePitroneExchanged(event: ExchangedEvent): void {
  let entity = new PitroneExchange(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.inpiAmount = event.params.inpiAmount
  entity.pitroneAmount = event.params.pitroneAmount
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}