"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

const keys = [
  { id: "1", name: "Production API Key", keyPreview: "sl_a1b2c3d4...x9y0", lastUsed: "2 hours ago", expires: "Never", createdAt: "2024-03-01" },
  { id: "2", name: "Staging API Key", keyPreview: "sl_e5f6g7h8...w1v2", lastUsed: "1 day ago", expires: "2024-12-31", createdAt: "2024-03-15" },
  { id: "3", name: "CI/CD Pipeline", keyPreview: "sl_i9j0k1l2...u3t4", lastUsed: "5 min ago", expires: "Never", createdAt: "2024-03-20" },
];

export default function ApiKeysPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  function handleCreate() {
    setCreatedKey("sl_" + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2));
    setShowCreate(false);
    setNewKeyName("");
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
              <Button onClick={handleCreate} disabled={!newKeyName}>Create</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Keys ({keys.length})</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <TableCell className="text-right"><Button variant="destructive" size="sm">Revoke</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
