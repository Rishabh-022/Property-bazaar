const dotenv = require('dotenv');
dotenv.config();

const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { email: 'propertybazzarsupport@gmail.com', name: 'PropertyBazzar' },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API Error Details:', errorData);
      throw new Error('Failed to send email');
    }

    const data = await response.json();
    console.log('Email sent successfully via Brevo Fetch API!');
    return data;
    
  } catch (error) {
    console.error('Server Network Error:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = sendEmail;