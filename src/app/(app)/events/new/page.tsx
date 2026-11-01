'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2, CalendarPlus, ImagePlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Input, Select, Textarea } from '@/components/ui/input';
import { type EventType, uploadImage, useCreateEvent } from '@/hooks/use-events';
import { myOrganizationQuery } from '@/hooks/use-organization';

const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: 'plant_drive', label: 'Plantation Drive' },
  { value: 'cleanup_drive', label: 'Garbage / Cleanup Drive' },
  { value: 'recycling_drive', label: 'Recycling Drive' },
  { value: 'workshop', label: 'Eco Workshop' },
  { value: 'awareness', label: 'Awareness Campaign' },
  { value: 'other', label: 'Other Community Event' },
];

export default function NewEventPage() {
  const router = useRouter();
  const createEvent = useCreateEvent();
  const { data: myOrg } = useQuery(myOrganizationQuery());
  const org = myOrg?.organization;

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [type, setType] = React.useState<EventType>('plant_drive');
  const [visibility, setVisibility] = React.useState<
    'public' | 'organization_only' | 'invite_only'
  >('public');
  const [startAt, setStartAt] = React.useState('');
  const [endAt, setEndAt] = React.useState('');
  const [venueName, setVenueName] = React.useState('');
  const [venueAddress, setVenueAddress] = React.useState('');
  const [venueMapUrl, setVenueMapUrl] = React.useState('');
  const [capacity, setCapacity] = React.useState('50');
  const [coverUrl, setCoverUrl] = React.useState('');
  const [uploadingCover, setUploadingCover] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<unknown>(null);

  // Set sensible default future start/end datetimes after mount
  React.useEffect(() => {
    const start = new Date(Date.now() + 3 * 86_400_000);
    start.setHours(9, 0, 0, 0);
    const end = new Date(start.getTime() + 3 * 3_600_000);
    const toLocalInput = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    setStartAt(toLocalInput(start));
    setEndAt(toLocalInput(end));
  }, []);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setUploadError(null);
    try {
      const url = await uploadImage(file, 'event_cover');
      setCoverUrl(url);
    } catch (err) {
      setUploadError(err);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createEvent.mutateAsync({
      title: title.trim(),
      description: description.trim(),
      type,
      visibility,
      organizationId: visibility === 'organization_only' ? myOrg?.organization?.id : undefined,
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      venueName: venueName.trim(),
      venueAddress: venueAddress.trim() || undefined,
      venueMapUrl: venueMapUrl.trim() || undefined,
      capacity: Math.max(2, Number(capacity) || 50),
      coverUrl: coverUrl.trim() || undefined,
      publish: true,
    });
    router.push(`/events/${created.slug}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to Events
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Host an Eco Event
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Organize a plantation drive, cleanup drive, or workshop. Registered attendees receive QR
          passes that you can scan on the event day to credit points & EcoCoins.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Event Title"
            placeholder="e.g. Sunday Mangrove Plantation Drive"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={4}
            maxLength={120}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Event Type"
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
            >
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>

            <Select
              label="Visibility"
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as 'public' | 'organization_only' | 'invite_only')
              }
            >
              <option value="public">Public (Listed in directory)</option>
              {org && (
                <option value="organization_only">
                  Organization Only (Exclusive to {org.name})
                </option>
              )}
              <option value="invite_only">Invite only (Via direct link)</option>
            </Select>
          </div>

          {visibility === 'organization_only' && org && (
            <div className="flex items-center gap-2 rounded-xs border border-primary/20 bg-accent/40 p-2.5 text-xs text-foreground">
              <Building2 className="size-4 shrink-0 text-positive" />
              <span>
                Exclusive event for <strong>{org.name}</strong> members only.
              </span>
            </div>
          )}

          <Textarea
            label="Description & Instructions"
            placeholder="Describe what participants will do, what to bring (gloves, reusable water bottle), and meeting point details…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minLength={20}
            maxLength={4000}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              type="datetime-local"
              label="Starts At"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
            />
            <Input
              type="datetime-local"
              label="Ends At"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Venue Name"
              placeholder="e.g. Carter Road Promenade"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              required
            />
            <Input
              type="number"
              label="Participant Capacity"
              min={2}
              max={10000}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
            />
          </div>

          <Input
            label="Full Venue Address"
            placeholder="Bandstand, Bandra West, Mumbai 400050"
            value={venueAddress}
            onChange={(e) => setVenueAddress(e.target.value)}
            required
          />

          <Input
            type="url"
            label="Venue Map URL (Optional)"
            placeholder="e.g. https://maps.google.com/?q=..."
            value={venueMapUrl}
            onChange={(e) => setVenueMapUrl(e.target.value)}
          />

          {/* Optional Cover Image Upload */}
          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-foreground">
              Cover Image (Optional)
            </span>
            <div className="flex flex-wrap items-center gap-3 rounded-sm border border-border bg-muted/30 p-3">
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xs bg-secondary px-3 text-xs font-semibold text-secondary-foreground transition hover:bg-secondary/90">
                <ImagePlus className="size-3.5" />
                <span>{uploadingCover ? 'Uploading…' : 'Upload cover photo'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverUpload}
                  className="sr-only"
                />
              </label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="Or paste image URL (https://…)"
                className="h-9 flex-1 rounded-xs border border-input bg-card px-2.5 text-xs text-foreground"
              />
            </div>
            {uploadError != null && <ErrorBanner error={uploadError} />}
          </div>

          {createEvent.isError && <ErrorBanner error={createEvent.error} />}

          <div className="flex justify-end gap-2 pt-2">
            <Link href="/events">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" loading={createEvent.isPending}>
              <CalendarPlus className="size-4" />
              Publish Event
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
