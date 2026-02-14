export interface InviteCode {
  _id?: string | unknown;
  code: string;
  createdBy: string;
  expiresAt?: Date;
  usedBy?: string;
  usedAt?: Date;
  isUsed: boolean;
  createdAt?: Date;
}

export interface CreateInviteCode {
  createdBy: string;
  expiresAt?: Date;
}

export interface RedeemInviteCode {
  code: string;
  userId: string;
}
