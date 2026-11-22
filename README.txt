QuizVilla redesign — Stage 1 package

This package contains the first implementation milestone:
- styles/design-system.css (new shared premium design tokens and reusable primitives)
- homepage/home.html (redesigned homepage structure)
- homepage/home.css (responsive premium homepage styling)
- homepage/home.js (original homepage behaviour retained, with profile image and existing coin/heart balances displayed)

Apply it by extracting this ZIP into the root of your existing QUIZZ-APP repository and allowing the files to merge/replace. It does not include the rest of the game project or media assets.

Important:
- Keep the existing images/, sounds/, Quizpage/, RegisterPage/, StorePage/, SettingsPage/, EditPage/, Avatar/, LoadingPage/ and photoCapture/ folders.
- No backend, leaderboard, new progression system, or quiz mechanics have been added in this milestone.
- The homepage reads only existing localStorage values: username, profileImage, coinCount, heartNum, musicState, musicTime, soundState, theme, oldUser, showWelcome, dailyFact and lastFetchDate.
- Test the page through a local HTTP server or GitHub Pages; opening HTML directly with file:// can block browser APIs.

Validation performed:
- JavaScript syntax check passed (node --check).
- HTML parser check passed.
- Existing homepage JavaScript hooks/selectors were retained, including play, exit modal, share, audio, fact display, and footer navigation.
- Full browser interaction testing has not yet been performed.
