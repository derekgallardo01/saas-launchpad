"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useCurrentOrg } from "@/lib/org-context";

export default function SettingsPage() {
  const { orgId } = useCurrentOrg();
  const [orgName, setOrgName] = useState("Acme Inc");
  const [slug, setSlug] = useState("acme-inc");

  const orgQuery = trpc.organization.getById.useQuery({ orgId }, { retry: false });
  const updateMutation = trpc.organization.update.useMutation({
    onSuccess: () => {
      orgQuery.refetch();
    },
  });
  const deleteMutation = trpc.organization.delete.useMutation();

  useEffect(() => {
    if (orgQuery.data) {
      setOrgName(orgQuery.data.name ?? "Acme Inc");
      setSlug(orgQuery.data.slug ?? "acme-inc");
    }
  }, [orgQuery.data]);

  function handleSave() {
    updateMutation.mutate({ orgId, name: orgName });
  }

  function handleDelete() {
    deleteMutation.mutate({ orgId });
  }

  if (orgQuery.isLoading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton className="mb-2 h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="mb-1 h-6 w-20" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-28" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold dark:text-white">Settings</h1>
        <p className="text-zinc-500">Manage your organization settings.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Update your organization details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Organization Name</label>
              <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Slug</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              <p className="mt-1 text-xs text-zinc-500">Used in URLs: app.example.com/{slug}</p>
            </div>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            {updateMutation.error && (
              <p className="text-sm text-red-500">{updateMutation.error.message}</p>
            )}
            {updateMutation.isSuccess && (
              <p className="text-sm text-green-600">Changes saved.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions that affect your entire organization.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-red-200 p-4 dark:border-red-800">
              <div>
                <p className="font-medium dark:text-white">Delete Organization</p>
                <p className="text-sm text-zinc-500">Permanently delete this organization and all its data.</p>
              </div>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
            {deleteMutation.error && (
              <p className="mt-2 text-sm text-red-500">{deleteMutation.error.message}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
