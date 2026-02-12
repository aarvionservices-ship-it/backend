# Email Service Configuration

This application supports two email service providers:
1. **Resend** (recommended for production)
2. **Nodemailer** (SMTP-based, fallback option)

## How It Works

The email service automatically selects the provider based on your environment configuration:

- **If `RESEND_API_KEY` is set**: The application will use Resend to send emails
- **If `RESEND_API_KEY` is not set or empty**: The application will fall back to Nodemailer with SMTP configuration

## Configuration

### Option 1: Using Resend (Recommended)

1. Sign up for a Resend account at [resend.com](https://resend.com)
2. Get your API key from the Resend dashboard
3. Add the API key to your `.env` file:

```bash
RESEND_API_KEY=re_your_api_key_here
```

4. Configure the sender email (must be a verified domain in Resend):

```bash
EMAIL_USER=noreply@yourdomain.com
```

**Note**: With Resend, you need to verify your domain. For testing, you can use `onboarding@resend.dev`.

### Option 2: Using Nodemailer (SMTP)

If you don't set a `RESEND_API_KEY`, the application will use Nodemailer with your SMTP settings:

```bash
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
SMTP_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

**For Gmail users**: You need to generate an App Password:
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account Settings → Security → App Passwords
3. Generate a new app password for "Mail"
4. Use that password in `EMAIL_PASS`

## Benefits of Each Provider

### Resend
- ✅ Better deliverability rates
- ✅ Simple API
- ✅ Built-in analytics
- ✅ No SMTP configuration needed
- ✅ Better for production environments
- ❌ Requires domain verification

### Nodemailer (SMTP)
- ✅ Works with any SMTP provider
- ✅ No account signup needed (if you have email)
- ✅ Good for development/testing
- ❌ May have deliverability issues
- ❌ Requires SMTP configuration
- ❌ Gmail has sending limits

## Testing

After configuration, the application will log which service is being used on startup:

```
Email service: Using Resend
```
or
```
Email service: Using Nodemailer
```

## Switching Between Services

To switch from Nodemailer to Resend:
1. Add your `RESEND_API_KEY` to `.env`
2. Restart the application

To switch from Resend to Nodemailer:
1. Remove or comment out `RESEND_API_KEY` in `.env`
2. Ensure SMTP settings are configured
3. Restart the application

## Example .env Configuration

### Using Resend
```bash
# Resend Configuration
RESEND_API_KEY=re_abc123xyz
EMAIL_USER=noreply@yourdomain.com

# SMTP settings (not used when Resend is configured)
SMTP_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Using Nodemailer
```bash
# Resend Configuration (empty or not set)
RESEND_API_KEY=

# SMTP settings (will be used)
EMAIL_USER=aarvionservices@gmail.com
EMAIL_PASS=your_app_password_here
SMTP_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

## Troubleshooting

### Resend Issues
- **Error: "Invalid API key"**: Check that your API key is correct
- **Error: "Domain not verified"**: Verify your domain in Resend dashboard
- **Emails not sending**: Check Resend dashboard for delivery logs

### Nodemailer Issues
- **Error: "Invalid login"**: Check your email and password
- **Gmail blocking**: Enable "Less secure app access" or use App Password
- **Connection timeout**: Check SMTP host and port settings
- **TLS/SSL errors**: Try toggling `SMTP_SECURE` between `true` and `false`

## API Usage

The email service is used throughout the application. No code changes are needed - it automatically uses the configured provider:

```javascript
const sendEmail = require('./services/emailService');

await sendEmail(
    'recipient@example.com',
    'Subject Line',
    'Plain text content',
    '<h1>HTML content</h1>'
);
```
