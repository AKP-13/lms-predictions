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

