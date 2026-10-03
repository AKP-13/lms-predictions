# LMS Predictions

A predictions and league app. Users sign in, then submit picks for gameweeks and tournament stages.

## Language

**Auth method**:
A way a user proves their identity at sign-in. This app supports two: magic link (a one-time emailed link) and password. A user's account may have one, both, or add the second one later. Setting up one method never removes the other.
_Avoid_: Login method, sign-in type

**Sign up**:
The explicit flow where a new user creates an account by choosing a password. Separate from sign in, with its own form. Magic link has no equivalent step: any email address either signs in or silently creates an account.
_Avoid_: Register, create account

**Sign in**:
The flow where a returning user proves their identity, using either an existing password or a magic link. It has one page, `/login`. Auth.js redirects its own generated page there.
_Avoid_: Log in, login

**Home page**:
The page at `/`, where a player makes the weekly pick and researches it. On a phone it has five tabs: **This week** (the season tiles, the current game, and the pick), **Fixtures**, **Injuries**, **Table** (the league table), and **Planner** (the Pick Planner).
_Avoid_: Dashboard, Picks page

**Account page**:
The signed-in page at `/account` where a user manages their own account. Today it holds the set-password form. It needs a session and nothing else.
_Avoid_: Profile, settings page

**Set password**:
The act of choosing a password for an account that already exists. One form covers both the first password and every later one. It never asks for the current password: the session is the authorization. This is how a magic-link user adds a password.
_Avoid_: Change password, update password, reset password

**Forgotten password**:
The flow for a user who cannot sign in because they do not know their password. A link on `/login` leads to `/forgot-password`, which asks for an email and sends the ordinary magic link. The link signs the user in and lands them on the set-password form. No second token system and no second email template exist. An email with no account gets the same link, which creates the account and lands on the home page, so the response never says whether the account exists.
_Avoid_: Password reset, reset link, reset token

**Password rules**:
The three checks every new password passes: at least 12 characters, no more than 72 bytes, and not in the breach list. Sign-up and the account page call one helper.
_Avoid_: Password policy, password strength

**Breach check**:
The test that refuses a password which appears in a public list of breached passwords. It sends the first five characters of the password's hash to the Have I Been Pwned range API, then matches the rest of the hash itself. Neither the password nor its whole hash leaves the server.
_Avoid_: Pwned check, HIBP check

**Failed attempt**:
One sign-in attempt with a password that the app refused. The app records the email address entered, the IP address it came from, and the time. It keeps the row for one day.
_Avoid_: Failed login, bad attempt

**Attempt window**:
The period the app looks back over when it counts failed attempts. Attempts before the window do not count.
_Avoid_: Lockout period, cooldown

**Rate limit**:
The refusal of further password attempts once the failed attempts inside the window reach a threshold. One threshold counts attempts for an email address, the other counts attempts from an IP address. The account stays usable: no attempt locks it.
_Avoid_: Lockout, throttle, ban

**Default league**:
The league the app enrols every new user in as soon as their account exists, whatever their auth method. The user does not choose it.
_Avoid_: Shared league, WC league

**Enrol**:
To place a user in a league without the user choosing it. Contrast with join, where the user picks the league.
_Avoid_: Auto-enrol, add to a league
