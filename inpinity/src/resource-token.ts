import { BigInt } from "@graphprotocol/graph-ts"
import {
  TransferSingle as TransferSingleEvent,
  TransferBatch as TransferBatchEvent,
  ApprovalForAll as ApprovalForAllEvent
} from "../generated/ResourceToken/ResourceToken"
import { ResourceTransfer, ResourceApprovalForAll, ResourceBalance } from "../generated/schema"

export function handleTransferSingle(event: TransferSingleEvent): void {
  let id = event.transaction.hash.concatI32(event.logIndex.toI32())
  let transfer = new ResourceTransfer(id)
  transfer.operator = event.params.operator
  transfer.from = event.params.from
  transfer.to = event.params.to
  transfer.resourceId = event.params.id
  transfer.amount = event.params.value
  transfer.blockNumber = event.block.number
  transfer.blockTimestamp = event.block.timestamp
  transfer.transactionHash = event.transaction.hash
  transfer.save()

  // Absender-Balance aktualisieren
  let fromId = event.params.from.toHex() + '-' + event.params.id.toString()
  let fromBal = ResourceBalance.load(fromId)
  if (fromBal) {
    fromBal.amount = fromBal.amount.minus(event.params.value)
    fromBal.save()
  }

  // Empfänger-Balance aktualisieren
  let toId = event.params.to.toHex() + '-' + event.params.id.toString()
  let toBal = ResourceBalance.load(toId)
  if (!toBal) {
    toBal = new ResourceBalance(toId)
    toBal.account = event.params.to
    toBal.resourceId = event.params.id
    toBal.amount = BigInt.fromI32(0)
  }
  toBal.amount = toBal.amount.plus(event.params.value)
  toBal.save()
}

export function handleTransferBatch(event: TransferBatchEvent): void {
  // Vereinfachte Behandlung: nur erstes Element speichern
  let id = event.transaction.hash.concatI32(event.logIndex.toI32())
  let transfer = new ResourceTransfer(id)
  transfer.operator = event.params.operator
  transfer.from = event.params.from
  transfer.to = event.params.to
  transfer.resourceId = event.params.ids[0]
  transfer.amount = event.params.values[0]
  transfer.blockNumber = event.block.number
  transfer.blockTimestamp = event.block.timestamp
  transfer.transactionHash = event.transaction.hash
  transfer.save()
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let id = event.transaction.hash.concatI32(event.logIndex.toI32())
  let approval = new ResourceApprovalForAll(id)
  approval.owner = event.params.account
  approval.operator = event.params.operator
  approval.approved = event.params.approved
  approval.blockNumber = event.block.number
  approval.blockTimestamp = event.block.timestamp
  approval.transactionHash = event.transaction.hash
  approval.save()
}