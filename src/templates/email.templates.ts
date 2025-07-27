export class EmailTemplates {
  static verification(data: { name: string; verificationUrl: string }) {
    return {
      subject: `Confirme seu e-mail - ⚡ Trigger.oi`,
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
              background: #f9fafb;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: #1A56F0;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #ffffff;
              padding: 30px;
              border-radius: 0 0 8px 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #1A56F0;
              color: white;
              text-decoration: none;
              font-weight: bold;
              font-size: 16px;
              border-radius: 6px;
              margin: 30px auto;
              text-align: center;
            }
            .footer {
              font-size: 12px;
              color: #6b7280;
              margin-top: 30px;
            }
            .center {
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚡ Trigger.oi</h1>
            </div>
            <div class="content">
              <h2>Confirme seu e-mail</h2>
              <p>Olá, ${data.name},</p>
              <p>Obrigado por se registrar na Trigger.oi. Clique no botão abaixo para confirmar seu endereço de e-mail:</p>
              <div class="center">
                <a href="${data.verificationUrl}" class="button" style="color: white;" target="_blank" rel="noopener noreferrer">Confirmar E-mail</a>
              </div>
              <p>Se você não criou esta conta, pode ignorar este e-mail.</p>
              <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p class="footer">
                A Trigger.oi nunca pedirá que você informe sua senha ou dados bancários por e-mail.
              </p>
              <p class="footer">
                Esta mensagem foi enviada por Trigger.oi Inc. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Confirme seu endereço de e-mail

Olá, ${data.name},

Obrigado por se registrar na Trigger.oi.
Clique no link abaixo para confirmar seu e-mail:

${data.verificationUrl}

Se você não criou esta conta, pode ignorar este e-mail.

------------------------------------------------------------

A Trigger.oi nunca enviará um e-mail solicitando sua senha ou dados bancários.

Mensagem enviada por Trigger.oi Inc. Todos os direitos reservados.
      `.trim(),
    };
  }

  static passwordReset(data: { name: string; resetUrl: string }) {
    return {
      subject: `Redefina sua senha - ⚡ Trigger.oi`,
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
              background: #f9fafb;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: #1A56F0;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #1A56F0;
              color: white;
              text-decoration: none;
              font-weight: bold;
              font-size: 16px;
              border-radius: 6px;
              margin: 30px auto;
              text-align: center;
            }
            .footer {
              font-size: 12px;
              color: #6b7280;
              margin-top: 30px;
            }
            .center {
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚡ Trigger.oi</h1>
            </div>
            <div class="content">
              <h2>Redefinição de senha</h2>
              <p>Olá, ${data.name},</p>
              <p>Recebemos uma solicitação para redefinir a senha da sua conta Trigger.oi.</p>
              <p>O link abaixo é válido por <strong>10 minutos</strong>. Clique no botão para criar uma nova senha:</p>
              <div class="center">
                <a href="${data.resetUrl}" style="color: white;" class="button" target="_blank" rel="noopener noreferrer">Redefinir Senha</a>
              </div>
              <p>Se você não solicitou a redefinição de senha, pode ignorar este e‑mail. Seu acesso continuará seguro.</p>
              <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p class="footer">
                A Trigger.oi nunca pedirá que você informe sua senha ou dados bancários por e‑mail.
              </p>
              <p class="footer">
                Esta mensagem foi enviada por Trigger.oi Inc. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Redefinição de senha

Olá, ${data.name},

Recebemos uma solicitação para redefinir a senha da sua conta Trigger.oi.
O link abaixo é válido por 10 minutos:

${data.resetUrl}

Se você não solicitou a redefinição de senha, basta ignorar esta mensagem.
Seu acesso continuará seguro.

------------------------------------------------------------

A Trigger.oi nunca enviará um e‑mail solicitando sua senha ou dados bancários.
Mensagem enviada por Trigger.oi Inc. Todos os direitos reservados.
      `.trim(),
    };
  }
}
