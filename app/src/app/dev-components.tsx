import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

import { DayStrip } from '@/components/charts/day-strip';
import { LegendItem } from '@/components/charts/legend-item';
import { LineChart } from '@/components/charts/line-chart';
import { MiniBars } from '@/components/charts/mini-bars';
import { ProgressBar } from '@/components/charts/progress-bar';
import { StatCard } from '@/components/charts/stat-card';
import { WakeWindowRing } from '@/components/charts/wake-window-ring';
import { WeekChart } from '@/components/charts/week-chart';
import { AmountPicker } from '@/components/tracking/amount-picker';
import { BabyProfileCard } from '@/components/tracking/baby-profile-card';
import { DaySummary } from '@/components/tracking/day-summary';
import { FamilyMemberRow } from '@/components/tracking/family-member-row';
import { GrowthMeasurement } from '@/components/tracking/growth-measurement';
import { LogTile } from '@/components/tracking/log-tile';
import { NappyPicker } from '@/components/tracking/nappy-picker';
import { NextNapCard } from '@/components/tracking/next-nap-card';
import { PerkRow, PlanCard } from '@/components/tracking/plan-card';
import { PredictionFeedback } from '@/components/tracking/prediction-feedback';
import { ReasonTile } from '@/components/tracking/reason-tile';
import { SideToggle } from '@/components/tracking/side-toggle';
import { SinceLastTile } from '@/components/tracking/since-last-tile';
import { TimeRow } from '@/components/tracking/time-row';
import { TimelineEntry } from '@/components/tracking/timeline-entry';
import { TimerCard } from '@/components/tracking/timer-card';
import { TimerMiniBar } from '@/components/tracking/timer-mini-bar';
import { Badge } from '@/components/ui/badge';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChildSwitcher } from '@/components/ui/child-switcher';
import { Chip } from '@/components/ui/chip';
import { DateStrip } from '@/components/ui/date-strip';
import { Field } from '@/components/ui/field';
import { Header } from '@/components/ui/header';
import { Hero } from '@/components/ui/hero';
import { AppIcon, Mascot } from '@/components/ui/mascot';
import { IconButton } from '@/components/ui/icon-button';
import { IconTile } from '@/components/ui/icon-tile';
import { InsightCard } from '@/components/ui/insight-card';
import { ListGroup, ListRow } from '@/components/ui/list-row';
import { OptionCard } from '@/components/ui/option-card';
import { PageIndicator } from '@/components/ui/page-indicator';
import { SearchField } from '@/components/ui/search-field';
import { SectionHeader } from '@/components/ui/section-header';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { SelectionControl } from '@/components/ui/selection-control';
import { SignInButton } from '@/components/ui/sign-in-button';
import { Skeleton } from '@/components/ui/skeleton';
import { StateView } from '@/components/ui/state-view';
import { SyncStatus } from '@/components/ui/sync-status';
import { Text } from '@/components/ui/text';
import { Toast } from '@/components/ui/toast';
import { Tooltip } from '@/components/ui/tooltip';

/**
 * Development-only gallery of every V2 component (Figma "Design System & Components"), with sample data.
 * nappa://dev-components?section=1..4&theme=dark. Production builds redirect home.
 */
export default function DevComponents() {
  const { section = '1', theme } = useLocalSearchParams<{ section?: string; theme?: string }>();
  const insets = useSafeAreaInsets();
  const [seg, setSeg] = useState<'day' | 'week'>('day');
  const [ml, setMl] = useState(120);
  const [unit, setUnit] = useState<'ml' | 'oz'>('ml');
  useEffect(() => {
    if (theme === 'dark' || theme === 'light') Uniwind.setTheme(theme);
  }, [theme]);
  if (!__DEV__) return <Redirect href="/" />;
  const now = new Date();
  const dayStart = new Date(now).setHours(0, 0, 0, 0);
  const H = 3_600_000;

  const sections: Record<string, React.ReactNode> = {
    '1': (
      <>
        <Header type="home" title="Ada’s family" eyebrow="Good afternoon," avatar={{ initials: 'T' }} action={<IconButton icon="bell" label="Notifications" badge />} />
        <View className="flex-row flex-wrap gap-sm">
          <Button label="Start a nap" />
          <Button label="Pause" hierarchy="secondary" size="medium" />
          <Button label="Cancel" hierarchy="tertiary" size="medium" />
          <Button label="Delete" hierarchy="destructive" size="small" />
          <Button label="Saving" loading size="medium" />
          <Button label="Disabled" disabled size="medium" />
        </View>
        <View className="flex-row flex-wrap items-center gap-sm">
          <IconButton icon="back" label="Back" />
          <IconButton icon="plus" label="Add" variant="tinted" size="small" />
          <IconButton icon="plus" label="Log" variant="primary" size="large" elevation="floating" />
          <IconButton icon="more" label="More" variant="ghost" />
          <IconButton icon="bell" label="Bell" disabled />
        </View>
        <View className="flex-row flex-wrap gap-sm">
          {(['outline', 'selected', 'neutral', 'sleep', 'feed', 'nappy', 'care'] as const).map((v) => (
            <Chip key={v} label={v} variant={v} size={v === 'outline' ? 'medium' : 'small'} leadingIcon={v === 'selected' ? 'check' : undefined} />
          ))}
        </View>
        <SignInButton provider="apple" label="Continue with Apple" />
        <SignInButton provider="google" label="Continue with Google" />
        <Field label="Baby’s name" value="Ada" onChangeText={() => {}} helper="Only you and your caregivers see this." />
        <Field label="Email" value="ada@" onChangeText={() => {}} error="Enter a full email address." />
        <Field type="select" label="Feeding" value="" placeholder="Choose one" onPress={() => {}} />
        <SearchField label="Search" value="" onChangeText={() => {}} placeholder="Type or say it…" />
        <View className="flex-row flex-wrap">
          <SelectionControl type="toggle" checked={false} />
          <SelectionControl type="toggle" checked />
          <SelectionControl type="checkbox" checked={false} />
          <SelectionControl type="checkbox" checked />
          <SelectionControl type="radio" checked={false} />
          <SelectionControl type="radio" checked />
          <SelectionControl type="toggle" checked disabled />
        </View>
        <SegmentedControl label="Range" value={seg} onChange={setSeg} options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }]} />
        <DateStrip selected={now} onSelect={() => {}} onAdd={() => {}} />
        <ChildSwitcher name="Ada" onPress={() => {}} kids={[{ name: 'Ada', initials: 'AD', tone: 'feed' }, { name: 'Ola', initials: 'OL', tone: 'sleep' }]} />
      </>
    ),
    '2': (
      <>
        <SectionHeader title="Since last" action="See all" onAction={() => {}} />
        <View className="flex-row gap-md">
          <SinceLastTile tone="feed" label="Last feed" value="1h 10m" detail="Bottle · 120 ml" accessibilityLabel="Last feed" />
          <SinceLastTile tone="sleep" label="Awake" value="1h 35m" detail="Since 12:05" accessibilityLabel="Awake" />
          <SinceLastTile tone="nappy" label="Nappy" value="45m" detail="Wet" accessibilityLabel="Nappy" />
        </View>
        <NextNapCard state="predicted" countdown="In about 35 min" time="1:40 pm" window="Window until 2:10 pm" accessibilityLabel="Next nap" />
        <NextNapCard state="learning" chip="Learning" title="Learning Ada’s rhythm" body="Log 3 more naps and we’ll suggest her next window." progress={0.4} progressLabel="2 of 5 naps" accessibilityLabel="Learning" />
        <View className="flex-row gap-md">
          <LogTile type="feed" size="large" label="Feed" onPress={() => {}} onDetails={() => {}} />
          <LogTile type="sleep" size="large" label="Sleep" onPress={() => {}} onDetails={() => {}} />
        </View>
        <View className="flex-row gap-md">
          <LogTile type="feed" size="medium" label="Feed" onPress={() => {}} />
          <LogTile type="sleep" size="medium" label="Sleep" onPress={() => {}} />
          <LogTile type="nappy" size="medium" label="Nappy" onPress={() => {}} />
        </View>
        <View className="flex-row gap-sm">
          <LogTile type="nursing" size="small" label="Nursing" onPress={() => {}} />
          <LogTile type="medicine" size="small" label="Medicine" onPress={() => {}} />
          <LogTile type="tummy" size="small" label="Tummy time" onPress={() => {}} />
        </View>
        <View className="flex-row gap-md">
          <ReasonTile tone="sleep" label="Awake" value="1h 35m" />
          <ReasonTile tone="feed" label="Last feed" value="11:50" />
          <ReasonTile tone="care" label="Age" value="7 mo" />
        </View>
        <PredictionFeedback answer={null} onAnswer={() => {}} />
        <TimerCard kind="nursing" paused={false} title="Nursing" started="Started 1:40 pm" elapsed="00:42:10" elapsedLabel="42 minutes" onPauseResume={() => {}} onStop={() => {}}>
          <SideToggle active="left" times={{ left: '12:04', right: null }} onSelect={() => {}} />
        </TimerCard>
        <TimerMiniBar kind="sleep" label="Nap" elapsed="00:42:10" onOpen={() => {}} onStop={() => {}} />
        <TimeRow label="Time" value="Today, 1:05 pm" backdated onChange={() => {}} />
        <NappyPicker value="wet" onChange={() => {}} labels={{ wet: 'Wet', dirty: 'Dirty', both: 'Both' }} />
        <AmountPicker ml={ml} onChange={setMl} presets={[60, 90, 120, 150]} unit={unit} onUnitChange={setUnit} />
      </>
    ),
    '3': (
      <>
        <View>
          <TimelineEntry type="sleep" time="1:40 pm" title="Nap" detail="1:40 – 2:55 pm" value="1h 15m" />
          <TimelineEntry type="feed" time="11:55 am" title="Bottle" detail="Formula" value="120 ml" pendingSync />
        </View>
        <DaySummary title="Today so far" date="Wed 18 Nov" sleep={{ value: '11h 20m', label: 'Sleep', change: '+20m vs avg' }} feeds={{ value: '6', label: 'Feeds', change: 'Same as avg' }} nappies={{ value: '5', label: 'Nappies', change: '−1 vs avg' }} />
        <View className="flex-row gap-md">
          <GrowthMeasurement metric="Weight" value="7.4 kg" change="+0.3 kg since 2 Nov" />
          <GrowthMeasurement metric="Length" value="66 cm" change="+1 cm since 2 Nov" />
        </View>
        <BabyProfileCard name="Ada" initials="A" age="7 months · born 12 Apr" units={['ml', 'kg', '24h']} onEdit={() => {}} />
        <ListGroup>
          <FamilyMemberRow status="active" name="Kemi" initials="K" detail="Active now" role="Caregiver" online />
          <FamilyMemberRow status="pending" email="tunde@example.com" initials="TB" detail="Invite sent 2 days ago" resendLabel="Resend" onResend={() => {}} />
        </ListGroup>
        <PlanCard plan="Yearly" terms="7-day free trial, then £29.99/year" badge="Save 37%" selected onPress={() => {}} />
        <PlanCard plan="Monthly" terms="£3.99/month" selected={false} onPress={() => {}} />
        <PerkRow text="Wake-window report and trends" />
        <ListGroup>
          <ListRow leading={<IconTile icon="bottle" tone="feed" />} title="Same bottle again" subtitle="120 ml formula · last at 11:55 am" trailing={{ kind: 'chevron' }} onPress={() => {}} />
          <ListRow leading={<IconTile icon="globe" tone="neutral" />} title="Units" trailing={{ kind: 'value', value: 'ml' }} onPress={() => {}} />
          <ListRow leading={<IconTile icon="bell" tone="brand" />} title="Reminders" trailing={{ kind: 'toggle', checked: true }} onPress={() => {}} />
        </ListGroup>
        <OptionCard title="Breast milk" detail="Nursing or expressed" leading={<IconTile icon="log-nursing" tone="feed" />} selected onPress={() => {}} />
        <OptionCard title="Formula" detail="Bottle" leading={<IconTile icon="bottle" tone="feed" />} selected={false} onPress={() => {}} />
        <InsightCard tone="sleep" icon="moon" title="Naps are getting longer" body="Ada’s naps averaged 1h 20m this week, 15 min more than last week." link="Why this matters" onLink={() => {}} />
        <Card tone="brand">
          <Text tone="on-primary" variant="heading">Brand card</Text>
        </Card>
      </>
    ),
    '4': (
      <>
        <WeekChart
          title="Sleep this week"
          range="12–18 Nov"
          tone="sleep"
          summary="Sleep this week"
          average={12.3}
          averageLabel="Avg 12.3h"
          days={['T', 'F', 'S', 'S', 'M', 'T', 'W'].map((l, i) => ({ label: l, value: [11.8, 12.6, 11.3, 12.4, 11.9, 13, 11.3][i], valueLabel: '11.3h', today: i === 6 }))}
        />
        <View className="flex-row items-center gap-lg">
          <MiniBars tone="sleep" values={[18, 26, 22, 30, 20, 24, 14]} />
          <LegendItem label="Sleep" tone="sleep" />
          <LegendItem label="Today" tone="today" />
        </View>
        <Card>
          <DayStrip label="Day" data={{ dayStart, sleeps: [{ start: dayStart, end: dayStart + 7 * H }, { start: dayStart + 9.5 * H, end: dayStart + 10.5 * H }, { start: dayStart + 13 * H, end: dayStart + 14.2 * H }, { start: dayStart + 19.5 * H, end: dayStart + 24 * H }], feeds: [2, 7.2, 11, 15, 18.5].map((h) => dayStart + h * H), nappies: [7.5, 12, 16].map((h) => dayStart + h * H) }} />
        </Card>
        <View className="flex-row gap-md">
          <StatCard label="Longest sleep" value="5h 40m" change="+25m vs last week" />
          <StatCard label="Naps" value="3" change="Same as last week" changeTone="neutral" />
        </View>
        <ProgressBar value={0.6} label="60%" />
        <View className="flex-row justify-around">
          <WakeWindowRing progress={0.63} closing={false} value="1h 35m" caption="of 2h 30m" label="ring" />
          <WakeWindowRing progress={0.9} closing value="2h 15m" caption="of 2h 30m" label="ring" />
        </View>
        <LineChart metricLabel="Weight" latestValue="7.4 kg" summary="weight" axisLabels={['Apr', 'Jun', 'Aug', 'Oct', 'Nov']} legend="WHO reference range (for context)" points={[3.4, 4.6, 5.6, 6.3, 6.9, 7.4].map((v, i) => ({ t: i, value: v }))} band={[0, 5].map((t) => ({ t, low: 3 + t * 0.7, high: 4.2 + t * 0.85 }))} />
        <View className="flex-row flex-wrap gap-sm">
          {(['neutral', 'brand', 'success', 'warning', 'error', 'info'] as const).map((t) => (
            <Badge key={t} label={t} tone={t} />
          ))}
        </View>
        <Banner type="info" message="Predictions improve after 7 days of logs." />
        <Banner type="offline" message="You’re offline. Logs are saved on this phone." />
        <Banner type="error" message="We couldn’t save that. Try again." action="Retry" onAction={() => {}} />
        <Toast message="Feed logged · 2:05 pm" onUndo={() => {}} />
        <View className="flex-row gap-sm">
          <SyncStatus state="synced" label="Synced with Kemi" />
          <SyncStatus state="offline" label="Offline · saved on phone" />
        </View>
        <Tooltip text="Tap and hold a tile to log at an earlier time." onDismiss={() => {}} />
        <PageIndicator count={4} active={0} label="Step 1 of 4" />
        <Skeleton type="card" />
        <Skeleton type="tiles" />
        <StateView kind="empty" title="No naps logged yet" body="Tap + to log Ada’s first nap." action="Log a nap" onAction={() => {}} />
        <StateView kind="error" size="compact" title="Something went wrong" body="We couldn’t load today’s timeline." action="Try again" onAction={() => {}} />
      </>
    ),
    '5': (
      <>
        <View className="flex-row flex-wrap gap-md">
          {(['standing', 'happy', 'sleeping', 'feeding', 'swaddled', 'playing', 'crying', 'nappy-change', 'fussy'] as const).map((pose, i) => (
            <View key={pose} className={`items-center rounded-xl p-sm ${(['bg-feature-sleep', 'bg-feature-feed', 'bg-feature-nappy', 'bg-feature-care'] as const)[i % 4]}`}>
              <Mascot pose={pose} size={100} />
              <Text variant="caption">{pose}</Text>
            </View>
          ))}
        </View>
        <View className="flex-row items-center gap-lg">
          <AppIcon size={72} />
          <AppIcon size={36} />
        </View>
        <StateView kind="empty" title="Empty" body="Standing" />
        <StateView kind="error" title="Error" body="Fussy" />
        <StateView kind="offline" size="compact" title="Offline" body="Sleeping" />
        <View className="flex-row gap-md">
          <LogTile type="feed" size="medium" label="Feed" onPress={() => {}} />
          <LogTile type="sleep" size="medium" label="Sleep" onPress={() => {}} />
          <LogTile type="nappy" size="medium" label="Nappy" onPress={() => {}} />
        </View>
        <NextNapCard state="too-young" chip="Under 8 weeks" title="Follow the sleepy cues" body="Newborns nap when tired." accessibilityLabel="x" />
        <NextNapCard state="learning" chip="Learning" title="Learning" body="Log 2 more naps." progress={0.3} progressLabel="1 of 3" accessibilityLabel="x" />
      </>
    ),
    hero: (
      <Hero tone="sleep" mascot="sleeping">
        <Text variant="title-large" className="px-page pt-4xl">
          Next nap
        </Text>
      </Hero>
    ),
  };

  return (
    <ScrollView className="flex-1 bg-background-canvas" contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40 }} contentContainerClassName="gap-xl px-page">
      {sections[section]}
    </ScrollView>
  );
}
