import sendMail from "./utils/mailer";

const start = async () => {
  console.log("Email service started. Kafka consumer removed.");
};

start();
// "dev": "tsx --env-file=.env --watch src/index.ts"