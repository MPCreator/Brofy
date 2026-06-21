import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/mail'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const to = searchParams.get('to') || process.env.SMTP_USER || 'brofy.principal@gmail.com'

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #078EAD;">¡Prueba de Nodemailer Exitosa! 🐶🐱</h2>
      <p>Hola,</p>
      <p>Este es un correo electrónico de prueba enviado desde <strong>Brofy</strong> para validar la configuración de tu cuenta de correo.</p>
      <p>Si has recibido este mensaje, significa que tu conexión SMTP está funcionando perfectamente y de forma segura sin problemas de bloqueo.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">Este correo es generado de forma automática. No es necesario responder.</p>
    </div>
  `

  const result = await sendEmail({
    to,
    subject: 'Brofy - Prueba de Correo SMTP ✉️',
    html,
  })

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: `Correo de prueba enviado exitosamente a ${to}`,
      messageId: result.messageId,
    })
  } else {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
        tip: 'Verifica que hayas generado una "Contraseña de Aplicación" en la configuración de seguridad de tu cuenta de Google y que esté guardada en el archivo .env como SMTP_PASS.',
      },
      { status: 500 }
    )
  }
}
