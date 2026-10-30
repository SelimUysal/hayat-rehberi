# Mobile listening regression checklist

Use a real Android phone with Chrome, both in a browser tab and in the installed Hayat Rehberi PWA (if installed). Test a short and a long surah, with Wi-Fi and mobile data.

| Scenario | Expected result |
| --- | --- |
| Start recitation; pause in Android notification shade | Sound stops immediately, stays paused after 30+ seconds |
| Pause from lock screen, Bluetooth earbuds, or headset | On-screen button switches to Play; no watchdog restart |
| Resume from notification / headset | The same surah, ayah and approximate second resumes once |
| Tap Next / Previous from Android media controls | The neighboring ayah starts exactly once |
| Seek on Android progress control when supported | The current ayah moves to that second, bookmark persists |
| Allow multiple ayahs and a surah boundary to play | Gapless preloads continue without duplicate streams |
| Lock/unlock the device while playing | Playback continues where the browser/OS permits; screen stays synchronized |
| Pause, lock phone for a minute, reopen app | Recitation remains paused, not restarted |
| Switch to another main section, then return to listening | Prior player is stopped and cleaned; last ayah/second is restored as a paused bookmark |
| Close and reopen the PWA/browser tab | The last surah and ayah appear; tap Play to resume. Never auto-start audio without user gesture |
| Lose network temporarily during active playback | Connection recovery retries from saved position; only while playback is requested |
| Lose network after an explicit pause | No retry or surprise playback |
| Run sleep timer through screen lock | Timer stops recitation, with no later automatic restart |
| Switch dark/night listening mode, change speed, reopen | Display choice and speed are preserved |
| Visit listening route repeatedly | At most one recitation stream is audible |
| Check non-Chromium browser / iOS Safari | In-page controls work even if some OS media actions are unsupported |

Android/browser policies may terminate background web audio to save memory or battery. A website cannot guarantee uninterrupted playback once the OS kills the browser process; it must restore a saved position instead.
