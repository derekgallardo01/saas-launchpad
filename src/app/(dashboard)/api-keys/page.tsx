"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useCurrentOrg } from "@/lib/org-context";

const fallbackKeys = [
  { id: "1", name: "Production API Key", keyPreview: "sl_a1b2c3d4...x9y0", lastUsed: "2 hours ago", expires: "Never", createdAt: "2024-03-01" },
  { id: "2", name: "Staging API Key", keyPreview: "sl_e5f6g7h8...w1v2", lastUsed: "1 day ago", expires: "2024-12-31", createdAt: "2024-03-15" },
  { id: "3", name: "CI/CD Pipeline", keyPreview: "sl_i9j0k1l2...u3t4", lastUsed: "5 min ago", expires: "Never", createdAt: "2024-03-20" },
];

export default function ApiKeysPage() {
  const { orgId } = useCurrentOrg();
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const keysQuery = trpc.apiKey.list.useQuery({ orgId }, { retry: false });
  const createMutation = trpc.apiKey.create.useMutation({
    onSuccess: (data) => {
      setCreatedKey(data.plainKey);
      setShowCreate(false);
      setNewKeyName("");
      keysQuery.refetch();
    },
  });
  const revokeMutation = trpc.apiKey.revoke.useMutation({
    onSuccess: () => {
      keysQuery.refetch();
    },
  });

  const queryKeys = keysQuery.data;
  const keys = queryKeys
    ? queryKeys.map((k) => ({
        id: k.id,
        name: k.name,
        keyPreview: k.key,
        lastUsed: k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never",
        expires: k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : "Never",
        createdAt: new Date(k.createdAt).toLocaleDateString(),
      }))
    : fallbackKeys;

  function handleCreate() {
    if (!newKeyName) return;
    createMutation.mutate({ orgId, name: newKeyName });
  }

  function handleRevoke(keyId: string) {
    revokeMutation.mutate({ orgId, keyId });
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">API Keys</h1>
          <p className="text-zinc-500">Manage programmatic access to your organization.</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>Create Key</Button>
      </div>

      {createdKey && (
        <Card className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="pt-6">
            <p className="mb-2 text-sm font-medium text-green-800 dark:text-green-200">Your new API key (copy it now — you won&apos;t see it again):</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-white p-2 font-mono text-sm dark:bg-zinc-900">{createdKey}</code>
              <Button size="sm" onClick={() => { navigator.clipboard.writeText(createdKey); }}>Copy</Button>
              <Button size="sm" variant="ghost" onClick={() => setCreatedKey(null)}>Dismiss</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showCreate && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Input placeholder="Key name (e.g., Production API)" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} className="flex-1" />
              <select className="rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950">
                <option>Never expires</option>
                <option>30 days</option>
                <option>90 days</option>
                <option>1 year</option>
              </select>
              <Button onClick={handleCreate} disabled={!newKeyName || createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
            {createMutation.error && (
              <p className="mt-2 text-sm text-red-500">{createMutation.error.message}</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Keys ({keys.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {keysQuery.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="ml-auto h-8 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium dark:text-white">{key.name}</TableCell>
                    <TableCell><code className="text-sm text-zinc-500">{key.keyPreview}</code></TableCell>
                    <TableCell className="text-zinc-500">{key.lastUsed}</TableCell>
                    <TableCell><Badge variant={key.expires === "Never" ? "success" : "warning"}>{key.expires}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevoke(key.id)}
                        disabled={revokeMutation.isPending}
                      >
                        Revoke
                      </Button>
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
