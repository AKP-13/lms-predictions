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
The flow where a returning user proves their identity, using either an existing password or a magic link.
_Avoid_: Log in, login

**Default league**:
The league the app enrols every new user in as soon as their account exists, whatever their auth method. The user does not choose it.
_Avoid_: Shared league, WC league

**Enrol**:
To place a user in a league without the user choosing it. Contrast with join, where the user picks the league.
_Avoid_: Auto-enrol, add to a league
