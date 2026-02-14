export interface SquadMember {
  id: string;
  name: string;
  ridesWithUser: number;
}

export interface PendingSquadRequest {
  id: string;
  name: string;
  status: "sent" | "received";
  requestedAt: string;
}

export const mockSquadMembers: SquadMember[] = [
  { id: "1", name: "Alex Chen", ridesWithUser: 12 },
  { id: "2", name: "Jordan Smith", ridesWithUser: 5 },
  { id: "3", name: "Sam Rivera", ridesWithUser: 1 },
  { id: "4", name: "Casey Nguyen", ridesWithUser: 8 },
  { id: "5", name: "Riley Martinez", ridesWithUser: 3 },
  { id: "6", name: "Jamie Foster", ridesWithUser: 7 },
  { id: "7", name: "Quinn Adams", ridesWithUser: 2 },
  { id: "8", name: "Drew Collins", ridesWithUser: 4 },
];

export const mockPendingRequests: PendingSquadRequest[] = [
  { id: "1", name: "Taylor Kim", status: "sent", requestedAt: "Yesterday" },
  { id: "2", name: "Morgan Lee", status: "received", requestedAt: "Today" },
  { id: "3", name: "Jordan Blake", status: "sent", requestedAt: "2 days ago" },
  { id: "4", name: "Skyler Reed", status: "received", requestedAt: "Today" },
];
