import React, { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { HTTPS } from "@/lib/http";
import { IGroup } from "@/lib/types/group.types";
import { Auth } from "@/lib/auth";

const RequestToJoinButton = ({
  children,
  title = "Request to Join",
  size,
  className = "",
  onRequested,
  group,
}: {
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "icon" | null;
  title?: string;
  onRequested?: (value: boolean) => void;
  group: IGroup;
}) => {
  const groupId = group.id;
  const userId = Auth.id();
  const hasPendingRequest = !!group.pendingRequests?.find(
    (request) => request.sender_id === userId,
  );
  const isMember = group.members.find((member) => member.id === userId)
  const [loading, setLoading] = useState(false);

  const [requested, setRequested] = useState(hasPendingRequest);

  const handleJoin = async () => {
    setLoading(true);
    try {
      await HTTPS.post(`/groups/${groupId}/request`);
      setRequested(true);
      onRequested?.(true);
    } catch (e) {
      console.error(e);
      alert("Failed to send request.");
    } finally {
      setLoading(false);
    }
  };
  return isMember? <div className="w-full text-center p-2 bg-gray-400 text-white rounded-xl">Already a member</div> :(
    <Button
      variant="primary"
      size={size}
      loading={loading }
      disabled={requested}
      className={cn("rounded-xl flex-1", className)}
      onClick={handleJoin}
    >
      {requested
        ? "Request Sent!"
        : loading
          ? "Sending..."
          : (children ?? title)}
    </Button>
  );
};

export default RequestToJoinButton;
