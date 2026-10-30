<?php
/**
 * FitTrack Gym – PHPMailer Email Wrapper
 *
 * Provides a singleton-style mailer configured for SMTP.
 * Requires vendor/autoload.php (Composer).
 */

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/smtp.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

/**
 * Create and configure a PHPMailer instance
 */
function createMailer(): PHPMailer
{
    $mail = new PHPMailer(true);

    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = SMTP_AUTH;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = SMTP_SECURE === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = SMTP_PORT;
    $mail->SMTPDebug  = SMTP_DEBUG;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom(SMTP_FROM, SMTP_FROM_NAME);
    $mail->isHTML(true);

    return $mail;
}

/**
 * Send an OTP verification email
 *
 * @param string $toEmail  Recipient email
 * @param string $toName   Recipient name
 * @param string $otp      6-digit OTP (plain text)
 * @return bool
 */
function sendVerificationOTP(string $toEmail, string $toName, string $otp): bool
{
    try {
        $mail = createMailer();
        $mail->addAddress($toEmail, $toName);
        $mail->Subject = 'FitTrack – Verify Your Email Address';

        $mail->Body = buildOTPEmailHTML($otp, $toName, 'verify');
        $mail->AltBody = "Hi {$toName},\n\nYour FitTrack verification OTP is: {$otp}\n\nThis OTP expires in " . OTP_EXPIRY_MINUTES . " minutes.\n\nIf you did not register, ignore this email.\n\n– FitTrack Team";

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log('FitTrack Mailer Error (verify OTP): ' . $e->getMessage());
        return false;
    }
}

/**
 * Send a password reset OTP email
 *
 * @param string $toEmail  Recipient email
 * @param string $toName   Recipient name
 * @param string $otp      6-digit OTP (plain text)
 * @return bool
 */
function sendPasswordResetOTP(string $toEmail, string $toName, string $otp): bool
{
    try {
        $mail = createMailer();
        $mail->addAddress($toEmail, $toName);
        $mail->Subject = 'FitTrack – Password Reset OTP';

        $mail->Body = buildOTPEmailHTML($otp, $toName, 'reset');
        $mail->AltBody = "Hi {$toName},\n\nYour FitTrack password reset OTP is: {$otp}\n\nThis OTP expires in " . OTP_EXPIRY_MINUTES . " minutes. If you did not request a reset, ignore this email.\n\n– FitTrack Team";

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log('FitTrack Mailer Error (reset OTP): ' . $e->getMessage());
        return false;
    }
}

/**
 * Build the styled OTP email HTML
 */
function buildOTPEmailHTML(string $otp, string $name, string $type): string
{
    $title      = $type === 'reset' ? 'Password Reset Request' : 'Verify Your Email';
    $action     = $type === 'reset' ? 'reset your FitTrack password' : 'verify your FitTrack account';
    $warning    = $type === 'reset'
        ? 'If you did not request a password reset, please ignore this email. Your password will remain unchanged.'
        : 'If you did not create a FitTrack account, please ignore this email.';
    $expiry     = OTP_EXPIRY_MINUTES;

    $digits = str_split($otp);
    $digitBoxes = '';
    foreach ($digits as $d) {
        $digitBoxes .= "<span style=\"display:inline-block;width:44px;height:52px;line-height:52px;text-align:center;background:#f0fdf4;border:2px solid #10B981;border-radius:10px;font-size:28px;font-weight:700;color:#065F46;margin:0 4px;\">$d</span>";
    }

    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:560px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#064E3B 0%,#10B981 100%);padding:36px 40px;text-align:center;">
            <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:14px;line-height:56px;margin-bottom:12px;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Fit<span style="color:#a7f3d0;">Track</span></h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">Your Personal Fitness Platform</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1d21;">{$title}</h2>
            <p style="margin:0 0 28px;font-size:15px;color:#495057;line-height:1.6;">Hi <strong>{$name}</strong>, use this OTP to {$action}:</p>
            <div style="text-align:center;margin:0 0 28px;">{$digitBoxes}</div>
            <p style="margin:0 0 8px;font-size:13px;color:#868e96;text-align:center;">
              ⏱ This OTP expires in <strong>{$expiry} minutes</strong>
            </p>
            <hr style="border:none;border-top:1px solid #e9ecef;margin:28px 0;">
            <p style="margin:0;font-size:13px;color:#868e96;line-height:1.6;">{$warning}</p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #e9ecef;">
            <p style="margin:0;font-size:12px;color:#adb5bd;">&copy; 2026 FitTrack. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
}
