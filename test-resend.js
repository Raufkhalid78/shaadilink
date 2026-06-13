const { Resend } = require('resend');

async function run() {
  const resend = new Resend('re_UCnz5Kik_DJ33Q38RTNkogqpuF7Lr9JcC');
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'test@example.com',
      subject: 'Hello World',
      html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
    });
    
    if (error) {
      console.error("Resend Error:", error);
    } else {
      console.log("Success:", data);
    }
  } catch (err) {
    console.error("Caught exception:", err);
  }
}

run();
