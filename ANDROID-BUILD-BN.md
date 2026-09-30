# FC+ LIVE TV — Android APK (phone-only build)

এই প্যাকেজে Capacitor configuration এবং GitHub Actions workflow যোগ করা হয়েছে।

## ফোন থেকে APK বানানোর ধাপ

1. পুরো project একটি GitHub repository-তে upload করুন।
2. GitHub → **Actions** → **Build FC+ LIVE TV Android APK** খুলুন।
3. **Run workflow** চাপুন।
4. Build শেষ হলে workflow-এর **Artifacts** থেকে `fcplus-live-tv-debug-apk` নামের artifact download করুন।
5. ZIP খুলে `app-debug.apk` ফোনে install করুন।

## App ID

`com.fcplus.livetv`

## গুরুত্বপূর্ণ

বর্তমান source archive-এ `src/services/githubSync.ts`, `src/components/VideoPlayer.tsx` এবং `src/components/ScheduleSection.tsx`-এর মতো import হওয়া কিছু source file নেই। তাই এই archive দিয়ে CI build সরাসরি সফল নাও হতে পারে। ওই source files যোগ করলে workflow APK build করবে।

HTTP (non-HTTPS) video stream থাকলে Android network-security configuration আলাদা করে লাগতে পারে।
