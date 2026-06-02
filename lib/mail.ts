import nodemailer from 'nodemailer'

interface SendEmailParams {
  to: string
  subject: string
  html?: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const user = process.env.SMTP_USER || 'brofy.principal@gmail.com'
  const pass = process.env.SMTP_PASS

  if (!pass || pass === '' || pass.includes('REEMPLAZAR')) {
    console.warn('Nodemailer: SMTP_PASS no está configurada en .env.')
    return { success: false, error: 'Credenciales de correo no configuradas' }
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true para puerto 465 (SSL)
    auth: {
      user,
      pass,
    },
  })

  try {
    const info = await transporter.sendMail({
      from: `"Brofy" <${user}>`,
      to,
      subject,
      text,
      html,
    })

    console.log('Nodemailer: Correo enviado exitosamente:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('Nodemailer: Error al enviar correo:', error)
    return { success: false, error: error.message || error }
  }
}
