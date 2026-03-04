import {
    ProtectionBought as ProtectionBoughtEvent,
    ProtectionExpired as ProtectionExpiredEvent
  } from "../generated/MercenaryV2/MercenaryV2"
  import { Protection } from "../generated/schema"
  
  export function handleProtectionBoughtV2(event: ProtectionBoughtEvent): void {
    let protection = new Protection(event.params.tokenId.toString())
    protection.level = event.params.level
    protection.expiresAt = event.params.expiry
    protection.active = true
    protection.save()
  }
  
  export function handleProtectionExpiredV2(event: ProtectionExpiredEvent): void {
    let protection = Protection.load(event.params.tokenId.toString())
    if (protection) {
      protection.active = false
      protection.save()
    }
  }