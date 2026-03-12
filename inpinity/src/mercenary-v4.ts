import { BigInt, Bytes } from "@graphprotocol/graph-ts";

import {
  ProtectionSet,
  ProtectionExtended,
  ProtectionCancelled,
  ProtectionMoved,
  EmergencyProtectionMoved,
  ProtectionExpired,
  ProtectionSlotUnlocked,
  DefenderPointsAwarded,
  CleanupRewardPaid,
  BastionTitleSet,
} from "../generated/MercenaryV4/MercenaryV4";

import {
  MercenarySlotV4,
  MercenaryTokenProtectionV4,
  DefenderProfileV4,
  MercenaryCleanupV4,
  MercenaryTitleV4,
  MercenaryPointsEventV4,
} from "../generated/schema";

const ZERO = BigInt.fromI32(0);
const ONE = BigInt.fromI32(1);
const DAY = BigInt.fromI32(86400);

function slotId(user: Bytes, slotIndex: i32): string {
  return user.toHexString() + "-" + slotIndex.toString();
}

function tokenProtectionId(tokenId: BigInt): string {
  return tokenId.toString();
}

function eventId(hash: Bytes, logIndex: BigInt): string {
  return hash.toHexString() + "-" + logIndex.toString();
}

function protectionPercentFromTier(tier: i32): BigInt {
  if (tier == 1) return BigInt.fromI32(20);
  if (tier == 2) return BigInt.fromI32(30);
  if (tier == 3) return BigInt.fromI32(50);
  return ZERO;
}

function rankFromPoints(points: BigInt): i32 {
  if (points.ge(BigInt.fromI32(1001))) return 4;
  if (points.ge(BigInt.fromI32(600))) return 3;
  if (points.ge(BigInt.fromI32(250))) return 2;
  if (points.ge(BigInt.fromI32(100))) return 1;
  return 0;
}

function rankName(rank: i32): string {
  if (rank == 0) return "Watchman";
  if (rank == 1) return "Defender";
  if (rank == 2) return "Guardian";
  if (rank == 3) return "Citadel Keeper";
  return "Inpinity Bastion";
}

function discountBpsFromRank(rank: i32): BigInt {
  if (rank == 0) return BigInt.fromI32(200);
  if (rank == 1) return BigInt.fromI32(400);
  if (rank == 2) return BigInt.fromI32(600);
  if (rank == 3) return BigInt.fromI32(800);
  return BigInt.fromI32(1000);
}

function getOrCreateProfile(
  user: Bytes,
  blockTimestamp: BigInt,
  blockNumber: BigInt,
  txHash: Bytes
): DefenderProfileV4 {
  let id = user.toHexString();
  let profile = DefenderProfileV4.load(id);

  if (profile == null) {
    profile = new DefenderProfileV4(id);
    profile.user = user;
    profile.points = ZERO;
    profile.rank = 0;
    profile.rankName = "Watchman";
    profile.discountBps = BigInt.fromI32(200);
    profile.totalProtectedDays = ZERO;
    profile.successfulDefenses = ZERO;
    profile.sameBlockExtensions = ZERO;
    profile.cleanupActions = ZERO;
    profile.emergencyMovesUsed = ZERO;
    profile.slotsUnlocked = 1;
    profile.freeCleanupCredits = ZERO;
    profile.bastionTitle = "";
  }

  profile.updatedAt = blockTimestamp;
  profile.blockNumber = blockNumber;
  profile.transactionHash = txHash;
  profile.save();

  return profile;
}

function refreshProfileDerived(profile: DefenderProfileV4): void {
  let rank = rankFromPoints(profile.points);
  profile.rank = rank;
  profile.rankName = rankName(rank);
  profile.discountBps = discountBpsFromRank(rank);

  if (rank >= 2 && profile.freeCleanupCredits.equals(ZERO)) {
    profile.freeCleanupCredits = ONE;
  }

  profile.save();
}

function getOrCreateSlot(
  user: Bytes,
  slotIndex: i32,
  blockTimestamp: BigInt,
  blockNumber: BigInt,
  txHash: Bytes
): MercenarySlotV4 {
  let id = slotId(user, slotIndex);
  let slot = MercenarySlotV4.load(id);

  if (slot == null) {
    slot = new MercenarySlotV4(id);
    slot.user = user;
    slot.slotIndex = slotIndex;
    slot.tokenId = ZERO;
    slot.startTime = ZERO;
    slot.expiry = ZERO;
    slot.cooldownUntil = ZERO;
    slot.emergencyReadyAt = ZERO;
    slot.protectionTier = 0;
    slot.protectionPercent = ZERO;
    slot.active = false;
    slot.lastReason = "";
  }

  slot.updatedAt = blockTimestamp;
  slot.blockNumber = blockNumber;
  slot.transactionHash = txHash;
  slot.save();

  return slot;
}

function setTokenProtection(
  tokenId: BigInt,
  user: Bytes,
  slotIndex: i32,
  tier: i32,
  expiry: BigInt,
  active: boolean,
  blockTimestamp: BigInt,
  blockNumber: BigInt,
  txHash: Bytes
): void {
  let id = tokenProtectionId(tokenId);
  let tp = MercenaryTokenProtectionV4.load(id);

  if (tp == null) {
    tp = new MercenaryTokenProtectionV4(id);
    tp.tokenId = tokenId;
  }

  tp.user = user;
  tp.slotIndex = slotIndex;
  tp.protectionTier = tier;
  tp.protectionPercent = protectionPercentFromTier(tier);
  tp.expiry = expiry;
  tp.active = active;
  tp.updatedAt = blockTimestamp;
  tp.blockNumber = blockNumber;
  tp.transactionHash = txHash;
  tp.save();
}

function deactivateTokenProtection(
  tokenId: BigInt,
  blockTimestamp: BigInt,
  blockNumber: BigInt,
  txHash: Bytes
): void {
  let id = tokenProtectionId(tokenId);
  let tp = MercenaryTokenProtectionV4.load(id);
  if (tp == null) return;

  tp.active = false;
  tp.updatedAt = blockTimestamp;
  tp.blockNumber = blockNumber;
  tp.transactionHash = txHash;
  tp.save();
}

export function handleProtectionSetV4(event: ProtectionSet): void {
  let slotIndex = event.params.slotIndex;
  let tier = event.params.tier;

  let slot = getOrCreateSlot(
    event.params.user,
    slotIndex,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );

  slot.tokenId = event.params.tokenId;
  // KORREKT: Direkte Zuweisung, da event.params.startTime bereits BigInt ist
  slot.startTime = event.params.startTime;
  slot.expiry = event.params.expiry;
  slot.protectionTier = tier;
  slot.protectionPercent = protectionPercentFromTier(tier);
  slot.active = true;
  slot.lastReason = "PROTECTION_SET";
  slot.updatedAt = event.block.timestamp;
  slot.blockNumber = event.block.number;
  slot.transactionHash = event.transaction.hash;
  slot.save();

  setTokenProtection(
    event.params.tokenId,
    event.params.user,
    slotIndex,
    tier,
    event.params.expiry, // KORREKT: Direkte Übergabe
    true,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );

  let profile = getOrCreateProfile(
    event.params.user,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );
  refreshProfileDerived(profile);
}

export function handleProtectionExtendedV4(event: ProtectionExtended): void {
  let slot = getOrCreateSlot(
    event.params.user,
    event.params.slotIndex,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );

  let totalDays = ZERO;
  if (slot.startTime.gt(ZERO)) {
    // KORREKT: event.params.newExpiry direkt verwenden
    totalDays = event.params.newExpiry.minus(slot.startTime).div(DAY);
  }

  let tier = 1;
  if (totalDays.gt(BigInt.fromI32(2)) && totalDays.le(BigInt.fromI32(5))) {
    tier = 2;
  } else if (totalDays.gt(BigInt.fromI32(5))) {
    tier = 3;
  }

  slot.expiry = event.params.newExpiry; // KORREKT: Direkte Zuweisung
  slot.protectionTier = tier;
  slot.protectionPercent = protectionPercentFromTier(tier);
  slot.active = true;
  slot.lastReason = "PROTECTION_EXTENDED";
  slot.updatedAt = event.block.timestamp;
  slot.blockNumber = event.block.number;
  slot.transactionHash = event.transaction.hash;
  slot.save();

  setTokenProtection(
    event.params.tokenId,
    event.params.user,
    event.params.slotIndex,
    tier,
    event.params.newExpiry, // KORREKT: Direkte Übergabe
    true,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );

  let profile = getOrCreateProfile(
    event.params.user,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );
  profile.sameBlockExtensions = profile.sameBlockExtensions.plus(ONE);
  refreshProfileDerived(profile);
}

export function handleProtectionCancelledV4(event: ProtectionCancelled): void {
  let slot = getOrCreateSlot(
    event.params.user,
    event.params.slotIndex,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );

  slot.active = false;
  slot.expiry = event.params.cancelledAt; // KORREKT: Direkte Zuweisung
  slot.lastReason = event.params.reason;
  slot.updatedAt = event.block.timestamp;
  slot.blockNumber = event.block.number;
  slot.transactionHash = event.transaction.hash;
  slot.save();

  deactivateTokenProtection(
    event.params.tokenId,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );
}

export function handleProtectionMovedV4(event: ProtectionMoved): void {
  let slot = getOrCreateSlot(
    event.params.user,
    event.params.slotIndex,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );

  deactivateTokenProtection(
    event.params.oldTokenId,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );

  let tier = slot.protectionTier;
  let expiry = slot.expiry;

  slot.tokenId = event.params.newTokenId;
  slot.cooldownUntil = event.params.cooldownUntil; // KORREKT: Direkte Zuweisung
  slot.active = true;
  slot.lastReason = "PROTECTION_MOVED";
  slot.updatedAt = event.block.timestamp;
  slot.blockNumber = event.block.number;
  slot.transactionHash = event.transaction.hash;
  slot.save();

  setTokenProtection(
    event.params.newTokenId,
    event.params.user,
    event.params.slotIndex,
    tier,
    expiry,
    true,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );
}

export function handleEmergencyProtectionMovedV4(event: EmergencyProtectionMoved): void {
  let slot = getOrCreateSlot(
    event.params.user,
    event.params.slotIndex,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );

  deactivateTokenProtection(
    event.params.oldTokenId,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );

  let tier = slot.protectionTier;
  let expiry = slot.expiry;

  slot.tokenId = event.params.newTokenId;
  slot.cooldownUntil = event.params.resetAllowedAt; // KORREKT: Direkte Zuweisung
  slot.emergencyReadyAt = event.params.resetAllowedAt; // KORREKT: Direkte Zuweisung
  slot.active = true;
  slot.lastReason = "EMERGENCY_PROTECTION_MOVED";
  slot.updatedAt = event.block.timestamp;
  slot.blockNumber = event.block.number;
  slot.transactionHash = event.transaction.hash;
  slot.save();

  setTokenProtection(
    event.params.newTokenId,
    event.params.user,
    event.params.slotIndex,
    tier,
    expiry,
    true,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );

  let profile = getOrCreateProfile(
    event.params.user,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );
  profile.emergencyMovesUsed = profile.emergencyMovesUsed.plus(ONE);
  refreshProfileDerived(profile);
}

export function handleProtectionExpiredV4(event: ProtectionExpired): void {
  let slot = getOrCreateSlot(
    event.params.user,
    event.params.slotIndex,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );

  let profile = getOrCreateProfile(
    event.params.user,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );

  if (slot.startTime.gt(ZERO) && slot.expiry.ge(slot.startTime)) {
    let durationDays = slot.expiry.minus(slot.startTime).div(DAY);
    if (durationDays.gt(ZERO)) {
      profile.totalProtectedDays = profile.totalProtectedDays.plus(durationDays);
      profile.successfulDefenses = profile.successfulDefenses.plus(ONE);
    }
  }

  slot.active = false;
  slot.expiry = event.params.expiredAt; // KORREKT: Direkte Zuweisung
  slot.lastReason = "PROTECTION_EXPIRED";
  slot.updatedAt = event.block.timestamp;
  slot.blockNumber = event.block.number;
  slot.transactionHash = event.transaction.hash;
  slot.save();

  deactivateTokenProtection(
    event.params.tokenId,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );

  refreshProfileDerived(profile);
}

export function handleProtectionSlotUnlockedV4(event: ProtectionSlotUnlocked): void {
  let profile = getOrCreateProfile(
    event.params.user,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );

  profile.slotsUnlocked = event.params.newUnlockedSlots;
  refreshProfileDerived(profile);
}

export function handleDefenderPointsAwardedV4(event: DefenderPointsAwarded): void {
  let entity = new MercenaryPointsEventV4(
    eventId(event.transaction.hash, event.logIndex)
  );
  entity.user = event.params.user;
  entity.tokenId = event.params.tokenId;
  entity.points = event.params.points;
  entity.reason = event.params.reason;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  let profile = getOrCreateProfile(
    event.params.user,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );
  profile.points = profile.points.plus(event.params.points);
  refreshProfileDerived(profile);
}

export function handleCleanupRewardPaidV4(event: CleanupRewardPaid): void {
  let entity = new MercenaryCleanupV4(
    eventId(event.transaction.hash, event.logIndex)
  );
  entity.cleaner = event.params.cleaner;
  entity.tokenId = event.params.tokenId;
  entity.rewardResourceId = event.params.rewardResourceId;
  entity.amount = event.params.amount;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  let profile = getOrCreateProfile(
    event.params.cleaner,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );
  profile.cleanupActions = profile.cleanupActions.plus(ONE);
  refreshProfileDerived(profile);
}

export function handleBastionTitleSetV4(event: BastionTitleSet): void {
  let entity = new MercenaryTitleV4(
    eventId(event.transaction.hash, event.logIndex)
  );
  entity.user = event.params.user;
  entity.title = event.params.title;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  let profile = getOrCreateProfile(
    event.params.user,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash
  );
  profile.bastionTitle = event.params.title;
  refreshProfileDerived(profile);
}