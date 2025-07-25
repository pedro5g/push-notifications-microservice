export class EmailTemplates {
  static verification(data: {
    name: string;
    verificationUrl: string;
    companyName: string;
  }) {
    return {
      subject: `Confirme seu e-mail - ${data.companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .button { 
              display: inline-block; background: #4f46e5; color: white; 
              padding: 12px 24px; text-decoration: none; border-radius: 6px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${data.companyName}</h1>
            </div>
            <div class="content">
              <h2>Olá, ${data.name}!</h2>
              <p>Confirme seu e-mail clicando no botão abaixo:</p>
              <p><a href="${data.verificationUrl}" class="button">Confirmar E-mail</a></p>
              <p>Este link expira em 24 horas.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Olá, ${data.name}! Confirme seu e-mail: ${data.verificationUrl}`,
    };
  }
}
