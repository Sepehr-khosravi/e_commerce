# Authentication Routes

Base path:

`/api/auth`

## POST /api/auth/register

Starts registration using a phone number.

Authentication: not required.

Request:

```json
{
  "phone": "09123456789"
}
```

Development behavior:

1. Validate phone number.
2. Create/find the user.
3. Generate an OTP.
4. Store the verification record.
5. Log the OTP to the server console.

Example development log:

```text
[OTP] Verification code for 09123456789: 483921
```

## POST /api/auth/verify

Verifies the phone number and establishes the authenticated session.

Request:

```json
{
  "phone": "09123456789",
  "code": "483921"
}
```

Expected flow:

```text
OTP
 |
 v
Verify code
 |
 v
Mark phone verified
 |
 v
Create session
 |
 v
Set session cookie
```

## POST /api/auth/login

Starts login with the user's phone number.

Request:

```json
{
  "phone": "09123456789"
}
```

The server generates and logs a development OTP.

## POST /api/auth/logout

Requires an authenticated session.

Destroys/invalidate the current session and clears the authentication cookie.

## Session model

The browser keeps the session in a cookie. Protected routes resolve:

```text
Cookie
  -> Session
  -> User
  -> Authorization
```

The client should not manually pass a password or JWT for this session-based system.
