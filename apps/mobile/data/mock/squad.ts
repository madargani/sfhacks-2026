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
  { id: "1", name: "Isaiah Alvarez", ridesWithUser: 12 },
  { id: "2", name: "Hayden Ancheta", ridesWithUser: 5 },
  { id: "3", name: "Antonio Aramburu", ridesWithUser: 1 },
  { id: "4", name: "Julian Barajas", ridesWithUser: 8 },
  { id: "5", name: "Tanner Bartonico", ridesWithUser: 3 },
  { id: "6", name: "Junior Bojorquez", ridesWithUser: 7 },
  { id: "7", name: "Illia Borshchenko", ridesWithUser: 2 },
  { id: "8", name: "Kyle Botelho", ridesWithUser: 4 },
];

export const mockPendingRequests: PendingSquadRequest[] = [
  { id: "1", name: "Khaisen Chen", status: "sent", requestedAt: "Yesterday" },
  { id: "2", name: "Kevin Clements", status: "received", requestedAt: "Today" },
  { id: "3", name: "Brayden Concepcion", status: "sent", requestedAt: "2 days ago" },
  { id: "4", name: "Andre Dargani", status: "received", requestedAt: "Today" },
];
