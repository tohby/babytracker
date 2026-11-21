# Share and update Nappa on iPhone

Use **TestFlight** to give testers the same version of Nappa and to get future
updates on your own iPhone. The current Personal Team install is signed for your
phone. TestFlight creates a new build from the same source code. Both builds
include the JavaScript and can run with your Mac off.

## Build the first TestFlight version

You need an Expo account and a paid Apple Developer Program membership. From
the repository root, run this with Node.js 22.13 or newer:

```sh
cd app
unset NAPPA_PERSONAL_IOS_BUILD
npx testflight
```

Follow the prompts to link Nappa to an Expo project, sign in with your paid
Apple team, confirm the bundle ID `com.madebyidia.nappa`, and set up signing and
App Store Connect. Expo builds and uploads the app. Wait for it to finish
processing under **Apps → Nappa → TestFlight** in App Store Connect.
[Expo’s TestFlight command](https://docs.expo.dev/build-reference/npx-testflight/)

For tester builds, leave `EXPO_PUBLIC_API_URL` unset to use the hosted Nappa
API. The local Herd URL only works from your development environment.

## Invite testers

1. In **App Store Connect → Apps → Nappa → TestFlight**, create an **Internal
   Testing** group and add yourself so you can install the build on your iPhone.
2. Create an **External Testing** group for friends and other testers. Add the
   build, fill in the beta information and **What to Test**, then submit it for
   Apple’s Beta App Review. If sign-in is needed, include test credentials or
   instructions in the review information.
3. After approval, invite testers by email or create a public link for the
   group. Testers install Apple’s **TestFlight** app, open the invitation on
   their iPhone, and tap **Install** next to Nappa.

[Apple’s external tester instructions](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers/)

## Ship an update

1. From `app/`, run `npx testflight` again with the updated code and the same
   Expo project and Apple team. The command increments the build number.
2. When the build finishes processing, make it available to your internal
   group and add it to the existing external group. Add fresh **What to Test**
   notes and submit for review if prompted. Existing testers can keep using
   their original invitations.
3. On your iPhone, open **TestFlight → Nappa → Update**. Testers can do the same
   or enable automatic updates in TestFlight.

Before switching your own phone from the Personal Team install to TestFlight,
save a copy of any local-only logs using **Settings → Export your data** in
Nappa. If iOS requires you to remove the old install, deleting it also removes
its local data.

## Update only your current personal install

Connect and unlock your iPhone, then run this from `app/` with Xcode signed in
to the same Personal Team. Select your physical iPhone when prompted.

```sh
NAPPA_PERSONAL_IOS_BUILD=1 npx expo run:ios --configuration Release --device --no-bundler
```

If the signing profile expired or you’re switching from a push-enabled native
project, regenerate `ios/` first and then rerun the install command:

```sh
NAPPA_PERSONAL_IOS_BUILD=1 npx expo prebuild --clean --platform ios --no-install
```

This variant supports local reminders and has remote push disabled. Apple’s
Personal Team provisioning lasts seven days.
[Apple’s Personal Team limits](https://developer.apple.com/help/account/basics/about-your-developer-account)
