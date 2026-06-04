import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

EMAIL_USER = os.environ.get('EMAIL_USER', '')
EMAIL_PASSWORD = os.environ.get('EMAIL_PASSWORD', '')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'asmaalavudeen2646@gmail.com')

async def send_contact_email(name: str, email: str, subject: str, message: str) -> bool:
    """
    Send contact form notification email to admin
    """
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'Portfolio Contact: {subject}'
        msg['From'] = EMAIL_USER if EMAIL_USER else 'noreply@portfolio.com'
        msg['To'] = ADMIN_EMAIL

        # HTML body
        html = f"""
        <html>
          <head></head>
          <body>
            <h2 style="color: #3b82f6;">New Contact Form Submission</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Subject:</strong> {subject}</p>
            </div>
            <div style="background: white; padding: 20px; border-left: 4px solid #3b82f6;">
              <h3>Message:</h3>
              <p>{message}</p>
            </div>
            <hr style="margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px;">This email was sent from your portfolio contact form.</p>
          </body>
        </html>
        """

        part = MIMEText(html, 'html')
        msg.attach(part)

        # Send email if credentials are configured
        if EMAIL_USER and EMAIL_PASSWORD:
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                server.login(EMAIL_USER, EMAIL_PASSWORD)
                server.send_message(msg)
            logger.info(f"Contact email sent successfully to {ADMIN_EMAIL}")
            return True
        else:
            logger.warning("Email credentials not configured. Email not sent.")
            # Return True anyway to not break the flow - message is saved in DB
            return True

    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        # Return True to not break the flow - message is saved in DB
        return True
