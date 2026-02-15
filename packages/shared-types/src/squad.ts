export interface SquadInvitation {
  _id?: string | unknown;
  fromUserId: string;
  toUserId: string;
  status: "pending" | "accepted" | "declined";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateSquadInvitationRequest {
  fromUserId: string;
  toUserId: string;
}
