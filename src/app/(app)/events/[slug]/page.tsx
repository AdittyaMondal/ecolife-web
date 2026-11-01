'use client';

import { useQuery } from '@tanstack/react-query';
import jsQR from 'jsqr';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Camera,
  CameraOff,
  Check,
  CheckCircle2,
  Coins,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import * as React from 'react';
import QRCode from 'react-qr-code';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ModalDialog } from '@/components/ui/dialog';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Input, Select, Textarea } from '@/components/ui/input';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  downloadEventParticipantsCsv,
  EVENT_TYPE_LABEL,
  type EventItem,
  eventParticipantsQuery,
  eventPassQuery,
  eventQuery,
  passCodeFromQr,
  useAddCoHost,
  useCancelEvent,
  useCancelRegistration,
  useManualCheckIn,
  useRegisterForEvent,
  useScanPass,
  useUpdateEvent,
} from '@/hooks/use-events';
import { formatDateTimeRange, formatTime, initials, titleCase } from '@/lib/format';
import { getEventCoverUrl } from '@/lib/images';

function getEventStatusBadge(status: EventItem['status']) {
  switch (status) {
    case 'ongoing':
      return { label: 'Ongoing', tone: 'warning' as const };
    case 'completed':
      return { label: 'Completed', tone: 'neutral' as const };
    case 'cancelled':
      return { label: 'Cancelled', tone: 'danger' as const };
    case 'draft':
      return { label: 'Draft', tone: 'neutral' as const };
    default:
      return { label: 'Upcoming', tone: 'positive' as const };
  }
}

export default function EventDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const event = useQuery(eventQuery(slug));

  if (event.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-36 rounded-sm" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    );
  }

  if (event.isError || !event.data) {
    return (
      <div className="space-y-4">
        <Link href="/events">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
            Back to Events
          </Button>
        </Link>
        <ErrorBanner error={event.error} onRetry={() => event.refetch()} />
      </div>
    );
  }

  const ev = event.data;
  const isStaff = ev.viewer.isHost || ev.viewer.isCoHost;
  const statusBadge = getEventStatusBadge(ev.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/events">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
            Back to Events
          </Button>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="primary">{EVENT_TYPE_LABEL[ev.type] ?? titleCase(ev.type)}</Badge>
          <Badge tone={statusBadge.tone}>{statusBadge.label}</Badge>
          {ev.visibility === 'organization_only' && (
            <Badge tone="accent">
              <Building2 className="size-3" />
              Organization Only
            </Badge>
          )}
          {ev.viewer.isHost && <Badge tone="positive">You are Host</Badge>}
          {!ev.viewer.isHost && ev.viewer.isCoHost && (
            <Badge tone="positive">You are Co-Host</Badge>
          )}
        </div>
      </div>

      {/* Main Event Hero Card */}
      <EventOverviewCard event={ev} />

      {/* Two-Column Interactive Section: Pass / Registration on left, Host Scanner & Roster on right (or full width) */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className={isStaff ? 'lg:col-span-5 space-y-6' : 'lg:col-span-12'}>
          <AttendeePassSection event={ev} />
        </div>

        {isStaff && (
          <div className="lg:col-span-7 space-y-6">
            <HostScannerAndParticipants event={ev} />
          </div>
        )}
      </div>
    </div>
  );
}

function EventOverviewCard({ event: ev }: { event: EventItem }) {
  const [editOpen, setEditOpen] = React.useState(false);
  const cancelEvent = useCancelEvent();

  const capacityPct =
    ev.capacity > 0 ? Math.min(100, Math.round((ev.registeredCount / ev.capacity) * 100)) : 0;

  return (
    <Card className="p-6 space-y-6 shadow-subtle overflow-hidden">
      {/* Cover Image Banner */}
      <div className="relative -mx-6 -mt-6 h-64 sm:h-80 w-[calc(100%+3rem)] overflow-hidden bg-muted/40">
        <Image
          src={getEventCoverUrl(ev)}
          alt={ev.title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1200px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5 text-white">
            <span className="inline-flex rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              {EVENT_TYPE_LABEL[ev.type] ?? ev.type}
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl drop-shadow-sm">
              {ev.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Organization Host Banner */}
      {(Boolean(ev.organizationName) || Boolean(ev.organizationId)) && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-accent/40 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Building2 className="size-4 shrink-0 text-positive" />
            <span>
              Hosted by{' '}
              <strong className="font-semibold">{ev.organizationName || 'Organization'}</strong>
            </span>
          </div>
          {ev.visibility === 'organization_only' && (
            <Badge tone="accent" className="font-semibold">
              Exclusive to {ev.organizationName || 'Organization'} Members
            </Badge>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {ev.description}
          </p>
        </div>

        {ev.viewer.isHost && ev.status !== 'cancelled' && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Edit3 className="size-3.5" />
              Edit event
            </Button>
            <Button
              variant="destructive"
              size="sm"
              loading={cancelEvent.isPending}
              onClick={() => cancelEvent.mutate(ev.id)}
            >
              <XCircle className="size-3.5" />
              Cancel event
            </Button>
          </div>
        )}
      </div>

      {cancelEvent.isError && <ErrorBanner error={cancelEvent.error} />}

      {/* Info Tiles: Concentric rounded-sm inside Card p-6 */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-sm border border-border bg-muted/30 p-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Calendar className="size-4 text-positive" />
            <span>Date & Time</span>
          </div>
          <p className="mt-1 text-sm font-bold text-foreground">
            {formatDateTimeRange(ev.startAt, ev.endAt)}
          </p>
        </div>

        <div className="rounded-sm border border-border bg-muted/30 p-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <MapPin className="size-4 text-positive" />
            <span>Venue</span>
          </div>
          <p className="mt-1 text-sm font-bold text-foreground">{ev.venueName}</p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            {ev.venueAddress && <p className="text-xs text-muted-foreground">{ev.venueAddress}</p>}
            {ev.venueMapUrl && (
              <a
                href={ev.venueMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-xs border border-border bg-card px-2 py-0.5 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-positive"
              >
                <ExternalLink className="size-3 shrink-0" />
                <span>Open in Maps</span>
              </a>
            )}
          </div>
        </div>

        <div className="rounded-sm border border-border bg-muted/30 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4 text-positive" />
              Capacity
            </span>
            <span className="font-bold text-foreground tabular-nums">
              {ev.registeredCount} / {ev.capacity} ({ev.checkedInCount} checked in)
            </span>
          </div>
          <ProgressBar
            value={capacityPct}
            max={100}
            tone={capacityPct >= 100 ? 'warning' : 'primary'}
            aria-label="Registration capacity"
          />
        </div>
      </div>

      {/* Host Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/users/${ev.host.id}`}
            className="inline-flex items-center gap-2 rounded-xs border border-border bg-card px-2.5 py-1.5 font-semibold text-foreground hover:border-primary"
          >
            <span className="flex size-5 items-center justify-center rounded-xs bg-primary text-[10px] font-bold text-primary-foreground">
              {initials(ev.host.name)}
            </span>
            <span>Host: {ev.host.name}</span>
          </Link>
        </div>

        <div className="inline-flex items-center gap-1.5 font-semibold text-positive">
          <Coins className="size-4" />
          <span>Attendees earn EcoPoints & EcoCoins when their QR pass is scanned</span>
        </div>
      </div>

      {editOpen && <EditEventModal event={ev} open={editOpen} onClose={() => setEditOpen(false)} />}
    </Card>
  );
}

function AttendeePassSection({ event: ev }: { event: EventItem }) {
  const register = useRegisterForEvent();
  const cancelReg = useCancelRegistration();
  const pass = useQuery({
    ...eventPassQuery(ev.id),
    enabled: ev.viewer.registered,
  });
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable
    }
  };

  const isFull = ev.registeredCount >= ev.capacity;
  const isCancelled = ev.status === 'cancelled';
  const isCheckedIn = ev.viewer.passStatus === 'checked_in';

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-positive">
            Attendee Event Pass
          </p>
          <h2 className="mt-1 text-lg font-bold text-foreground">
            {isCheckedIn
              ? 'You are checked in!'
              : ev.viewer.registered
                ? 'Your QR Entry Pass'
                : 'Register to get your QR Pass'}
          </h2>
        </div>

        {isCheckedIn ? (
          <Badge tone="positive">
            <CheckCircle2 className="size-3.5" />
            Checked in
          </Badge>
        ) : ev.viewer.registered ? (
          <Badge tone="primary">
            <QrCode className="size-3.5" />
            Registered
          </Badge>
        ) : null}
      </div>

      {!ev.viewer.registered ? (
        <div className="space-y-4">
          <div className="rounded-sm border border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-2">
            <p>
              Registering generates your personal <strong>QR Event Pass</strong> (
              <code className="font-mono text-xs">ecolife://pass/…</code>).
            </p>
            <p>
              On the day of the drive, show your QR pass to the event host. Scanning your pass
              automatically credits your wallet with <strong>EcoPoints</strong> (boosting your
              leaderboard rank) and <strong>EcoCoins</strong> (for marketplace discounts).
            </p>
          </div>

          {register.isError && <ErrorBanner error={register.error} />}

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isFull || isCancelled}
            loading={register.isPending}
            onClick={() => register.mutate(ev.id)}
          >
            <Sparkles className="size-4" />
            {isCancelled
              ? 'Event Cancelled'
              : isFull
                ? 'Event at Full Capacity'
                : 'Register & Generate QR Pass'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {pass.isPending ? (
            <Skeleton className="h-64 w-full rounded-sm" />
          ) : pass.isError ? (
            <ErrorBanner error={pass.error} onRetry={() => pass.refetch()} />
          ) : pass.data ? (
            <div className="flex flex-col items-center rounded-sm border-2 border-primary bg-accent/30 p-5 text-center space-y-4">
              {/* Concentric QR Frame */}
              <div className="rounded-xs border border-border bg-white p-4 shadow-xs">
                <QRCode
                  value={pass.data.qrPayload}
                  size={184}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#202820"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pass Code
                </p>
                <div className="inline-flex items-center gap-2 rounded-xs border border-border bg-card px-3 py-1.5">
                  <code className="font-mono text-sm font-bold text-foreground">
                    {pass.data.passCode}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(pass.data.passCode)}
                    aria-label="Copy pass code"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {copied ? (
                      <Check className="size-3.5 text-positive" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] font-mono text-muted-foreground">{pass.data.qrPayload}</p>
              </div>

              <div className="w-full rounded-xs border border-border/80 bg-card/90 p-3 text-xs text-muted-foreground">
                {pass.data.status === 'checked_in' ? (
                  <span className="font-semibold text-positive">
                    ✓ Pass scanned & verified! Your points and EcoCoins have been credited.
                  </span>
                ) : (
                  <span>
                    Present this QR code to <strong>{ev.host.name}</strong> at{' '}
                    <strong>{ev.venueName}</strong> to check in and claim your rewards.
                  </span>
                )}
              </div>
            </div>
          ) : null}

          {!isCheckedIn && ev.status !== 'cancelled' && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                loading={cancelReg.isPending}
                onClick={() => cancelReg.mutate(ev.id)}
              >
                Cancel my registration
              </Button>
            </div>
          )}
          {cancelReg.isError && <ErrorBanner error={cancelReg.error} />}
        </div>
      )}
    </Card>
  );
}

function HostScannerAndParticipants({ event: ev }: { event: EventItem }) {
  const participants = useQuery(eventParticipantsQuery(ev.id));
  const scanPass = useScanPass(ev.id);
  const manualCheckIn = useManualCheckIn(ev.id);
  const addCoHost = useAddCoHost(ev.id);

  const [passInput, setPassInput] = React.useState('');
  const [cameraActive, setCameraActive] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [participantFilter, setParticipantFilter] = React.useState('');
  const [coHostUserId, setCoHostUserId] = React.useState('');
  const [exporting, setExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);
  const [lastScanResult, setLastScanResult] = React.useState<{
    userName: string;
    alreadyCheckedIn: boolean;
    points: number;
    coins: number;
  } | null>(null);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const lastScannedCodeRef = React.useRef<string>('');

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      setExportError(null);
      await downloadEventParticipantsCsv(ev.id, `${ev.slug}-attendees.csv`);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Failed to export participants.');
    } finally {
      setExporting(false);
    }
  };

  const submitPassCode = React.useCallback(
    async (raw: string) => {
      const code = passCodeFromQr(raw);
      if (!code || code.length < 4) return;
      const res = await scanPass.mutateAsync(code);
      setLastScanResult({
        userName: res.attendee.name,
        alreadyCheckedIn: res.alreadyCheckedIn,
        points: res.attendeeReward?.pointsDelta ?? 0,
        coins: res.attendeeReward?.coinsDelta ?? 0,
      });
      setPassInput('');
    },
    [scanPass],
  );

  // Live Camera QR Scanner Loop using jsQR
  React.useEffect(() => {
    if (!cameraActive) return;

    let stream: MediaStream | null = null;
    let rafId = 0;
    let cancelled = false;

    const startCamera = async () => {
      setCameraError(null);
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (cancelled) {
          for (const track of stream.getTracks()) track.stop();
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const tick = () => {
          if (cancelled) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const qr = jsQR(imageData.data, imageData.width, imageData.height);
              if (qr?.data) {
                const extracted = passCodeFromQr(qr.data);
                if (extracted && extracted !== lastScannedCodeRef.current) {
                  lastScannedCodeRef.current = extracted;
                  void submitPassCode(extracted);
                }
              }
            }
          }
          rafId = window.requestAnimationFrame(tick);
        };

        rafId = window.requestAnimationFrame(tick);
      } catch {
        setCameraError(
          'Could not access camera. You can still enter or paste attendee pass codes below.',
        );
        setCameraActive(false);
      }
    };

    void startCamera();

    return () => {
      cancelled = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      if (stream) {
        for (const track of stream.getTracks()) track.stop();
      }
    };
  }, [cameraActive, submitPassCode]);

  const handleManualCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passInput.trim()) return;
    await submitPassCode(passInput);
  };

  const handleManualPassCheckIn = async (passId: number) => {
    const res = await manualCheckIn.mutateAsync(passId);
    setLastScanResult({
      userName: res.attendee.name,
      alreadyCheckedIn: res.alreadyCheckedIn,
      points: res.attendeeReward?.pointsDelta ?? 0,
      coins: res.attendeeReward?.coinsDelta ?? 0,
    });
  };

  const allParticipants = participants.data?.items ?? [];
  const filteredParticipants = allParticipants.filter((p) => {
    const q = participantFilter.trim().toLowerCase();
    if (!q) return true;
    return p.user.name.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* QR Pass Scanner Console */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-positive">
              Host Check-In Console
            </p>
            <h2 className="mt-0.5 text-lg font-bold text-foreground">Scan Attendee QR Passes</h2>
          </div>

          <Button
            variant={cameraActive ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => {
              lastScannedCodeRef.current = '';
              setCameraActive((v) => !v);
            }}
          >
            {cameraActive ? (
              <>
                <CameraOff className="size-4" />
                Stop Camera
              </>
            ) : (
              <>
                <Camera className="size-4" />
                Open Camera Scanner
              </>
            )}
          </Button>
        </div>

        {cameraError && (
          <div className="rounded-sm border border-warning/40 bg-warning/10 p-3 text-xs text-foreground">
            {cameraError}
          </div>
        )}

        {cameraActive && (
          <div className="overflow-hidden rounded-sm border-2 border-primary bg-neutral-950 p-2 text-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className="mx-auto max-h-64 w-full rounded-xs object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            <p className="mt-2 text-xs text-primary">
              Point camera at attendee&apos;s <code className="font-mono">ecolife://pass/…</code> QR
              code
            </p>
          </div>
        )}

        {/* Pass Code / QR URI Input */}
        <form onSubmit={handleManualCodeSubmit} className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-52">
            <Input
              placeholder="Paste QR payload (ecolife://pass/…) or pass code"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              aria-label="Attendee pass code"
            />
          </div>
          <Button type="submit" variant="primary" loading={scanPass.isPending}>
            <QrCode className="size-4" />
            Verify & Credit Rewards
          </Button>
        </form>

        {scanPass.isError && <ErrorBanner error={scanPass.error} />}
        {manualCheckIn.isError && <ErrorBanner error={manualCheckIn.error} />}

        {/* Last Check-in Reward Confirmation */}
        {lastScanResult && (
          <div className="flex items-center justify-between gap-3 rounded-sm border border-positive/40 bg-accent/60 p-3.5 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="size-5 text-positive shrink-0" />
              <div>
                <p className="font-bold text-foreground">
                  {lastScanResult.userName}{' '}
                  {lastScanResult.alreadyCheckedIn ? 'was already checked in' : 'checked in!'}
                </p>
                {!lastScanResult.alreadyCheckedIn && (
                  <p className="text-positive font-semibold">
                    Credited +{lastScanResult.points} pts & +{lastScanResult.coins} EcoCoins
                  </p>
                )}
              </div>
            </div>
            <Badge tone="positive">Verified</Badge>
          </div>
        )}
      </Card>

      {/* Registered Participants List */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Registered Participants ({allParticipants.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              {ev.checkedInCount} checked in · {Math.max(0, ev.registeredCount - ev.checkedInCount)}{' '}
              awaiting check-in
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-48">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={participantFilter}
                onChange={(e) => setParticipantFilter(e.target.value)}
                placeholder="Filter participants…"
                aria-label="Filter participants"
                className="h-9 w-full rounded-sm border border-input bg-card pl-8 pr-3 text-xs text-foreground"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              loading={exporting}
              onClick={handleExportCsv}
              disabled={allParticipants.length === 0}
            >
              <Download className="size-3.5" />
              Export Attendees (CSV)
            </Button>
          </div>
        </div>

        {exportError && <ErrorBanner error={exportError} />}

        {participants.isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-sm" />
            <Skeleton className="h-12 w-full rounded-sm" />
          </div>
        ) : participants.isError ? (
          <ErrorBanner error={participants.error} onRetry={() => participants.refetch()} />
        ) : filteredParticipants.length === 0 ? (
          <p className="rounded-sm border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            No registered participants match this filter yet.
          </p>
        ) : (
          <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredParticipants.map((reg) => {
              const isCheckedIn = reg.status === 'checked_in';
              return (
                <li
                  key={reg.passId}
                  className="flex items-center justify-between gap-3 rounded-sm border border-border bg-muted/30 p-2.5"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xs bg-card border border-border text-xs font-bold text-foreground">
                      {initials(reg.user.name)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <Link
                          href={`/users/${reg.user.id}`}
                          className="truncate text-sm font-semibold text-foreground hover:text-positive"
                        >
                          {reg.user.name}
                        </Link>
                        {reg.email && (
                          <span className="truncate text-xs text-muted-foreground">
                            ({reg.email})
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground block truncate">
                        {isCheckedIn && reg.checkedInAt
                          ? `Checked in at ${formatTime(reg.checkedInAt)}`
                          : `Pass #${reg.passId} · ${reg.user.city ?? 'Community member'}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {isCheckedIn ? (
                      <Badge tone="positive">
                        <CheckCircle2 className="size-3" />
                        Checked in
                      </Badge>
                    ) : reg.status === 'cancelled' ? (
                      <Badge tone="danger">Cancelled</Badge>
                    ) : reg.status === 'no_show' ? (
                      <Badge tone="neutral">No Show</Badge>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={manualCheckIn.isPending}
                        onClick={() => handleManualPassCheckIn(reg.passId)}
                      >
                        <UserCheck className="size-3.5" />
                        Check in
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Co-Host Management (Host only) */}
      {ev.viewer.isHost && (
        <Card className="p-6 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Co-Host Permissions</h3>
            <p className="text-xs text-muted-foreground">
              Co-hosts can view the participant list and scan QR passes on the event day.
            </p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const uid = Number(coHostUserId.trim());
              if (!uid) return;
              await addCoHost.mutateAsync(uid);
              setCoHostUserId('');
            }}
            className="flex flex-wrap gap-2"
          >
            <div className="flex-1 min-w-48">
              <Input
                type="number"
                placeholder="Enter user ID (numeric) to add as co-host"
                value={coHostUserId}
                onChange={(e) => setCoHostUserId(e.target.value)}
                aria-label="Co-host user ID"
              />
            </div>
            <Button type="submit" variant="outline" size="md" loading={addCoHost.isPending}>
              <UserPlus className="size-4" />
              Add Co-Host
            </Button>
          </form>

          {addCoHost.isError && <ErrorBanner error={addCoHost.error} />}
        </Card>
      )}
    </div>
  );
}

function EditEventModal({
  event: ev,
  open,
  onClose,
}: {
  event: EventItem;
  open: boolean;
  onClose: () => void;
}) {
  const updateEvent = useUpdateEvent();
  const [title, setTitle] = React.useState(ev.title);
  const [description, setDescription] = React.useState(ev.description);
  const [capacity, setCapacity] = React.useState(String(ev.capacity));
  const [venueName, setVenueName] = React.useState(ev.venueName);
  const [venueAddress, setVenueAddress] = React.useState(ev.venueAddress ?? '');
  const [venueMapUrl, setVenueMapUrl] = React.useState(ev.venueMapUrl ?? '');
  const [visibility, setVisibility] = React.useState<EventItem['visibility']>(ev.visibility);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateEvent.mutateAsync({
      id: ev.id,
      title: title.trim(),
      description: description.trim(),
      capacity: Math.max(ev.registeredCount, Number(capacity) || ev.capacity),
      venueName: venueName.trim(),
      venueAddress: venueAddress.trim() || undefined,
      venueMapUrl: venueMapUrl.trim() || null,
      visibility,
    });
    onClose();
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Edit Event Details"
      description="Update the title, description, venue, map link, visibility, or capacity for your event."
    >
      <form onSubmit={handleSave} className="space-y-4">
        <Input
          label="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Venue Name"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            required
          />
          <Input
            type="number"
            label="Capacity"
            min={Math.max(2, ev.registeredCount)}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
        </div>
        <Input
          label="Venue Address"
          value={venueAddress}
          onChange={(e) => setVenueAddress(e.target.value)}
        />
        <Input
          type="url"
          label="Venue Map URL (Google Maps, OpenStreetMap, etc.)"
          placeholder="https://maps.google.com/?q=..."
          value={venueMapUrl}
          onChange={(e) => setVenueMapUrl(e.target.value)}
        />
        <Select
          label="Visibility"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as EventItem['visibility'])}
        >
          <option value="public">Public (Listed in directory)</option>
          <option value="invite_only">Invite only (Direct link)</option>
          {(Boolean(ev.organizationId) ||
            Boolean(ev.organizationName) ||
            ev.visibility === 'organization_only') && (
            <option value="organization_only">
              Organization only ({ev.organizationName ?? 'Members only'})
            </option>
          )}
        </Select>

        {updateEvent.isError && <ErrorBanner error={updateEvent.error} />}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={updateEvent.isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </ModalDialog>
  );
}
