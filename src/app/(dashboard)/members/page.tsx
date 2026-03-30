"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useCurrentOrg } from "@/lib/org-context";

const fallbackMembers = [
  { id: "1", name: "Derek G.", email: "derek@example.com", role: "OWNER" as const, image: null, joinedAt: "2024-01-15" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "ADMIN" as const, image: null, joinedAt: "2024-02-20" },
  { id: "3", name: "Mike Johnson", email: "mike@example.com", role: "MEMBER" as const, image: null, joinedAt: "2024-03-10" },
];

const roleBadgeVariant: Record<string, "default" | "success" | "warning"> = {
  OWNER: "default",
  ADMIN: "warning",
  MEMBER: "success",
};

export default function MembersPage() {
  const { orgId } = useCurrentOrg();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"MEMBER" | "ADMIN">("MEMBER");

  const membersQuery = trpc.member.list.useQuery({ orgId }, { retry: false });
  const inviteMutation = trpc.member.invite.useMutation({
    onSuccess: () => {
      setShowInvite(false);
      setInviteEmail("");
      membersQuery.refetch();
    },
  });

  const queryMembers = membersQuery.data;
  const members = queryMembers
    ? queryMembers.map((m) => ({
        id: m.user.id,
        name: m.user.name ?? "",
        email: m.user.email ?? "",
        role: m.role as "OWNER" | "ADMIN" | "MEMBER",
        image: m.user.image ?? null,
        joinedAt: new Date(m.createdAt).toISOString(),
      }))
    : fallbackMembers;

  function handleInvite() {
    if (!inviteEmail) return;
    inviteMutation.mutate({ orgId, email: inviteEmail, role: inviteRole });
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Members</h1>
          <p className="text-zinc-500">Manage your organization&apos;s team members.</p>
        </div>
        <Button onClick={() => setShowInvite(!showInvite)}>Invite Member</Button>
      </div>

      {showInvite && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Input placeholder="Email address" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="flex-1" />
              <select
                className="rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "MEMBER" | "ADMIN")}
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
              <Button onClick={handleInvite} disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? "Sending..." : "Send Invite"}
              </Button>
              <Button variant="ghost" onClick={() => setShowInvite(false)}>Cancel</Button>
            </div>
            {inviteMutation.error && (
              <p className="mt-2 text-sm text-red-500">{inviteMutation.error.message}</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Team Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {membersQuery.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={member.name} size="sm" />
                        <div>
                          <p className="font-medium dark:text-white">{member.name}</p>
                          <p className="text-sm text-zinc-500">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={roleBadgeVariant[member.role]}>{member.role}</Badge></TableCell>
                    <TableCell className="text-zinc-500">{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {member.role !== "OWNER" && <Button variant="ghost" size="sm">Remove</Button>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
