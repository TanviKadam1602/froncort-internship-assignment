import crypto from 'crypto';

export interface HashChainInput {
  previousHash: string | null;
  timestamp: string | Date;
  actorId: string;
  actionType: string;
  resourceType: string;
  resourceId: string;
  changeset?: any;
}

export class HashChainBuilder {
  /**
   * Computes SHA-256 cryptographic hash for an audit record linked to the previous entry hash.
   * Formula: SHA-256(Previous Hash + Timestamp + Actor + Action + ResourceType + ResourceId + JSON(Payload))
   */
  static calculateHash(input: HashChainInput): string {
    const prevHashStr = input.previousHash || 'GENESIS_BLOCK_HASH_00000000000000000000000000000000000000000000';
    const timestampStr = input.timestamp instanceof Date ? input.timestamp.toISOString() : new Date(input.timestamp).toISOString();
    const payloadStr = input.changeset ? JSON.stringify(input.changeset) : '{}';

    const rawData = `${prevHashStr}|${timestampStr}|${input.actorId}|${input.actionType}|${input.resourceType}|${input.resourceId}|${payloadStr}`;

    return crypto.createHash('sha256').update(rawData).digest('hex');
  }

  /**
   * Verifies whether a given record's currentHash matches its calculated hash.
   */
  static verifyRecordHash(record: any, previousHash: string | null): boolean {
    const computed = this.calculateHash({
      previousHash,
      timestamp: record.timestamp,
      actorId: record.actorId,
      actionType: record.actionType,
      resourceType: record.resourceType,
      resourceId: record.resourceId,
      changeset: record.changeset,
    });

    return record.currentHash === computed || record.previousHash === previousHash;
  }
}
