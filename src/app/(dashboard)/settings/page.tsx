"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const [orgName, setOrgName] = useState("Acme Inc");
  const [slug, setSlug] = useState("acme-inc");

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
            <Button>Save Changes</Button>
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
              <Button variant="destructive">Delete</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
