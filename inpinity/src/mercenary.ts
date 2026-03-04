import {
  ProtectionBought as ProtectionBoughtEvent,
  ProtectionExpired as ProtectionExpiredEvent
} from "../generated/MercenaryV1/MercenaryV1"
import { Protection } from "../generated/schema"

export function handleProtectionBought(event: ProtectionBoughtEvent): void {
  let tokenId = event.params.tokenId.toString()
  let protection = new Protection(tokenId)
  protection.level = event.params.level
  protection.expiresAt = event.params.expiry
  protection.active = true
  protection.save()
}

export function handleProtectionExpired(event: ProtectionExpiredEvent): void {
  let tokenId = event.params.tokenId.toString()
  let protection = Protection.load(tokenId)
  if (protection) {
    protection.active = false
    protection.save()
  }
}