export class EmailTemplates {
  static verification(data: { name: string; verificationUrl: string }) {
    return {
      subject: `Confirme seu e-mail - ⚡ Trigger.io`,
      html: `
       <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'JetBrains Mono', monospace;
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #172554 100%);
              margin: 0;
              padding: 0;
              min-height: 100vh;
              color: #f1f5f9;
            }
            
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 40px 20px;
            }
            
            .email-wrapper {
              background: rgba(15, 23, 42, 0.95);
              backdrop-filter: blur(12px);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 16px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
                          0 0 0 1px rgba(255, 255, 255, 0.05);
              overflow: hidden;
            }
            
            .header {
              background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.1) 50%, rgba(15, 23, 42, 0.95) 100%);
              border-bottom: 1px solid rgba(59, 130, 246, 0.2);
              color: #bfdbfe;
              padding: 32px 40px;
              text-align: center;
              position: relative;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-image: 
                linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
              background-size: 52px 52px;
              opacity: 0.3;
            }
            
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
              position: relative;
              z-index: 1;
            }
            
            .logo {
              display: inline-block;
              padding: 8px 16px;
              background: rgba(59, 130, 246, 0.1);
              border: 1px solid rgba(59, 130, 246, 0.2);
              border-radius: 8px;
              margin-bottom: 16px;
              font-size: 24px;
            }
            
            .content {
              padding: 40px;
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(15, 23, 42, 0.98) 100%);
            }
            
            .content h2 {
              color: #e2e8f0;
              font-size: 24px;
              font-weight: 600;
              margin: 0 0 24px 0;
              text-align: center;
            }
            
            .content p {
              color: #cbd5e1;
              line-height: 1.6;
              margin: 16px 0;
              font-size: 14px;
            }
            
            .button {
              display: inline-block;
              padding: 16px 32px;
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: white;
              text-decoration: none;
              font-weight: 600;
              font-size: 16px;
              border-radius: 10px;
              margin: 32px 0;
              text-align: center;
              border: 1px solid rgba(59, 130, 246, 0.3);
              box-shadow: 0 8px 25px -5px rgba(59, 130, 246, 0.3),
                          0 4px 6px -2px rgba(0, 0, 0, 0.3);
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 12px 30px -5px rgba(59, 130, 246, 0.4),
                          0 6px 8px -2px rgba(0, 0, 0, 0.4);
              background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
            }
            
            .center {
              text-align: center;
            }
            
            .divider {
              margin: 32px 0;
              border: none;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .footer {
              font-size: 12px;
              color: #94a3b8;
              margin: 16px 0 0 0;
              line-height: 1.5;
            }
            
            .warning-box {
              background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(180, 83, 9, 0.05) 100%);
              border: 1px solid rgba(245, 158, 11, 0.2);
              border-radius: 8px;
              padding: 16px;
              margin: 24px 0;
              color: #fed7aa;
              font-size: 13px;
            }
            
            .security-notice {
              background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.05) 100%);
              border: 1px solid rgba(34, 197, 94, 0.2);
              border-radius: 8px;
              padding: 16px;
              margin: 24px 0;
              color: #bbf7d0;
              font-size: 13px;
            }
            
            @media (max-width: 640px) {
              .container {
                padding: 20px 16px;
              }
              
              .content {
                padding: 24px 20px;
              }
              
              .header {
                padding: 24px 20px;
              }
              
              .email-wrapper {
                border-radius: 12px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-wrapper">
              <div class="header">
                <div class="logo">⚡ Trigger.io</div>
                <h1>Email Verification</h1>
              </div>
              <div class="content">
                <h2>Confirm Your Email Address</h2>
                <p>Hello, <strong>${data.name}</strong>,</p>
                <p>Thank you for signing up with Trigger.io. To complete your registration and secure your account, please verify your email address by clicking the button below:</p>
                
                <div class="center">
                  <a href="${data.verificationUrl}" class="button" style="color: white;" target="_blank" rel="noopener noreferrer">
                    Verify Email Address
                  </a>
                </div>
                
                <div class="warning-box">
                  <strong>⚠️ Important:</strong> This verification link will expire in 24 hours for security reasons.
                </div>
                
                <p>If you didn't create an account with Trigger.io, you can safely ignore this email. No account has been created.</p>
                
                <div class="security-notice">
                  <strong>🛡️ Security Notice:</strong> Trigger.io will never ask you to provide your password or banking information via email.
                </div>
                
                <hr class="divider">
                
                <p class="footer">
                  This message was sent by Trigger.io Inc. All rights reserved.<br>
                  If you have any questions, please contact our support team.
                </p>
                
                <p class="footer">
                  You received this email because you signed up for a Trigger.io account.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Confirm your email address

Hello, ${data.name},

Thank you for registering with Trigger.io.
Click on the link below to confirm your email:

${data.verificationUrl}

If you have not created this account, you can ignore this email.

------------------------------------------------------------

Trigger.io will never send you an email requesting your password or bank details.

Message sent by Trigger.io Inc. All rights reserved.
      `.trim(),
    };
  }

  static passwordReset(data: {
    name: string;
    resetUrl: string;
    resetCode: string;
  }) {
    return {
      subject: `Reset your password - ⚡ Trigger.io`,
      html: `
       <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'JetBrains Mono', monospace;
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #172554 100%);
                margin: 0;
                padding: 0;
                min-height: 100vh;
                color: #f1f5f9;
              }
              
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 40px 20px;
              }
              
              .email-wrapper {
                background: rgba(15, 23, 42, 0.95);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
                            0 0 0 1px rgba(255, 255, 255, 0.05);
                overflow: hidden;
              }
              
              .header {
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.1) 50%, rgba(15, 23, 42, 0.95) 100%);
                border-bottom: 1px solid rgba(239, 68, 68, 0.2);
                color: #fecaca;
                padding: 32px 40px;
                text-align: center;
                position: relative;
              }
              
              .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: 
                  linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
                background-size: 52px 52px;
                opacity: 0.3;
              }
              
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                position: relative;
                z-index: 1;
              }
              
              .logo {
                display: inline-block;
                padding: 8px 16px;
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.2);
                border-radius: 8px;
                margin-bottom: 16px;
                font-size: 24px;
              }
              
              .content {
                padding: 40px;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(15, 23, 42, 0.98) 100%);
              }
              
              .content h2 {
                color: #e2e8f0;
                font-size: 24px;
                font-weight: 600;
                margin: 0 0 24px 0;
                text-align: center;
              }
              
              .content p {
                color: #cbd5e1;
                line-height: 1.6;
                margin: 16px 0;
                font-size: 14px;
              }
              
              .reset-code-box {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%);
                border: 2px solid rgba(59, 130, 246, 0.3);
                border-radius: 12px;
                padding: 24px;
                margin: 32px 0;
                text-align: center;
                backdrop-filter: blur(8px);
              }
              
              .reset-code-label {
                color: #bfdbfe;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 16px;
                display: block;
              }
              
              .reset-code {
                font-size: 28px;
                font-weight: 700;
                color: #60a5fa;
                letter-spacing: 8px;
                margin: 16px 0;
                padding: 16px 24px;
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: 8px;
                display: inline-block;
                min-width: 200px;
                user-select: all;
                cursor: pointer;
              }
              
              .reset-code:hover {
                background: rgba(59, 130, 246, 0.15);
                transform: scale(1.02);
                transition: all 0.2s ease;
              }
              
              .copy-instruction {
                color: #94a3b8;
                font-size: 12px;
                margin-top: 8px;
              }
              
              .button {
                display: inline-block;
                padding: 16px 32px;
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
                text-decoration: none;
                font-weight: 600;
                font-size: 16px;
                border-radius: 10px;
                margin: 24px 0;
                text-align: center;
                border: 1px solid rgba(239, 68, 68, 0.3);
                box-shadow: 0 8px 25px -5px rgba(239, 68, 68, 0.3),
                            0 4px 6px -2px rgba(0, 0, 0, 0.3);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              }
              
              .button:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 30px -5px rgba(239, 68, 68, 0.4),
                            0 6px 8px -2px rgba(0, 0, 0, 0.4);
                background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
              }
              
              .center {
                text-align: center;
              }
              
              .divider {
                margin: 32px 0;
                border: none;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
              }
              
              .footer {
                font-size: 12px;
                color: #94a3b8;
                margin: 16px 0 0 0;
                line-height: 1.5;
              }
              
              .warning-box {
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(180, 83, 9, 0.05) 100%);
                border: 1px solid rgba(245, 158, 11, 0.2);
                border-radius: 8px;
                padding: 16px;
                margin: 24px 0;
                color: #fed7aa;
                font-size: 13px;
              }
              
              .security-notice {
                background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.05) 100%);
                border: 1px solid rgba(34, 197, 94, 0.2);
                border-radius: 8px;
                padding: 16px;
                margin: 24px 0;
                color: #bbf7d0;
                font-size: 13px;
              }
              
              .expiry-warning {
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(185, 28, 28, 0.05) 100%);
                border: 1px solid rgba(239, 68, 68, 0.2);
                border-radius: 8px;
                padding: 16px;
                margin: 24px 0;
                color: #fca5a5;
                font-size: 13px;
              }
              
              @media (max-width: 640px) {
                .container {
                  padding: 20px 16px;
                }
                
                .content {
                  padding: 24px 20px;
                }
                
                .header {
                  padding: 24px 20px;
                }
                
                .email-wrapper {
                  border-radius: 12px;
                }
                
                .reset-code {
                  font-size: 24px;
                  letter-spacing: 4px;
                  min-width: 160px;
                  padding: 12px 16px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="email-wrapper">
                <div class="header">
                  <div class="logo">⚡ Trigger.io</div>
                  <h1>Password Reset</h1>
                </div>
                <div class="content">
                  <h2>Reset Your Password</h2>
                  <p>Hello, <strong>${data.name}</strong>,</p>
                  <p>We received a request to reset the password for your Trigger.io account. You can use either the reset code below or click the direct link to create a new password.</p>
                  
                  <div class="reset-code-box">
                    <span class="reset-code-label">Your Reset Code</span>
                    <div class="reset-code">${data.resetCode}</div>
                    <div class="copy-instruction">Click the code above to select and copy it</div>
                  </div>
                  
                  <div class="center">
                    <p><strong>Or click the button below:</strong></p>
                    <a href="${data.resetUrl}" class="button" style="color: white;" target="_blank" rel="noopener noreferrer">
                      Reset Password Now
                    </a>
                  </div>
                  
                  <div class="expiry-warning">
                    <strong>⏰ Time Sensitive:</strong> This reset code and link will expire in exactly <strong>10 minutes</strong> for security reasons.
                  </div>
                  
                  <p>If you didn't request a password reset, you can safely ignore this email. Your account remains secure and no changes have been made.</p>
                  
                  <div class="warning-box">
                    <strong>⚠️ Security Tips:</strong>
                    <ul style="margin: 8px 0; padding-left: 20px;">
                      <li>Never share this reset code with anyone</li>
                      <li>Use a strong, unique password</li>
                    </ul>
                  </div>
                  
                  <div class="security-notice">
                    <strong>🛡️ Security Notice:</strong> Trigger.io will never ask you to provide your current password or banking information via email.
                  </div>
                  
                  <hr class="divider">
                  
                  <p class="footer">
                    This message was sent by Trigger.io Inc. All rights reserved.<br>
                    If you have any questions about account security, please contact our support team immediately.
                  </p>
                  
                  <p class="footer">
                    You received this email because a password reset was requested for your Trigger.io account.
                  </p>
                </div>
              </div>
            </div>
          </body>
          </html>
      `,
      text: `
Password reset

Hello, ${data.name},

We have received a request to reset your Trigger.io account password.
The link below is valid for 10 minutes:

${data.resetUrl}

If you did not request a password reset, simply ignore this message.
Your access will remain secure.

------------------------------------------------------------

Trigger.io will never send you an e‑mail requesting your password or bank details.
Message sent by Trigger.io Inc. All rights reserved.
      `.trim(),
    };
  }
}
