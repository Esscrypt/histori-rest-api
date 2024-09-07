import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_APP_PASSWORD!,
  },
});

export const sendResetEmail = async (user: any, resetToken: string) => {
  const resetLink = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;
  await transporter.sendMail({
    from: "noreply@esscrypt.com",
    to: user.email,
    subject: 'Password Reset',
    text: `Click here to reset your password: ${resetLink}`,
  });
};
