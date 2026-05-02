import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import dbConnection from "../src/db/index.js";
import { User } from "../src/models/user.model.js";

const usage = () => {
  console.log("Usage: node scripts/make-admin.js --phone=9000000005");
  console.log("Or:    node scripts/make-admin.js --id=69f06dbd2e219ee8b8762517");
};

async function main() {
  await dbConnection();

  const args = process.argv.slice(2);
  let phone = null;
  let id = null;

  for (const a of args) {
    if (a.startsWith("--phone=")) phone = a.split("=")[1];
    if (a.startsWith("--id=")) id = a.split("=")[1];
  }

  if (!phone && !id) {
    usage();
    process.exit(1);
  }

  let user = null;

  if (phone) {
    user = await User.findOne({ phoneNumber: phone });
  } else if (id) {
    user = await User.findById(id);
  }

  if (!user) {
    console.error("User not found");
    process.exit(2);
  }

  user.isAdmin = true;
  await user.save();

  console.log(`User ${user._id} promoted to admin (phone: ${user.phoneNumber})`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(10);
});
