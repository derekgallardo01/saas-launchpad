"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

const members = [
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
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

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
              <select className="rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950">
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
              <Button>Send Invite</Button>
              <Button variant="ghost" onClick={() => setShowInvite(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Team Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
