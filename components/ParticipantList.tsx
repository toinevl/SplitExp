import { ParticipantDTO } from "@/lib/types";

interface ParticipantListProps {
  participants: ParticipantDTO[];
}

export function ParticipantList({ participants }: ParticipantListProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3">
        Participants ({participants.length})
      </h3>
      {participants.length === 0 ? (
        <p className="text-gray-600 text-sm">No participants yet</p>
      ) : (
        <ul className="space-y-2">
          {participants.map((p) => (
            <li
              key={p.id}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg"
            >
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
