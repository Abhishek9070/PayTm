import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import dbConnection from "../src/db/index.js";
import { User } from "../src/models/user.model.js";
import { Wallet } from "../src/models/walet.model.js";

const usage = () => {
  console.log("Usage: node scripts/make-admin.js --phone=9065971126");
  console.log("Or:    node scripts/make-admin.js --id=69f06dbd2e219ee8b8762517");
  console.log("Or:    node scripts/make-admin.js --create --fullName='Test Admin' --phone=9000000001 --password='Admin@123' [--email=test@example.com]");
};

const parseArgs = (args) => {
  const parsed = {
    create: false,
    phone: null,
    id: null,
    fullName: null,
    email: null,
    password: null
  };

  for (const arg of args) {
    if (arg === "--create") parsed.create = true;
    if (arg.startsWith("--phone=")) parsed.phone = arg.split("=")[1];
    if (arg.startsWith("--id=")) parsed.id = arg.split("=")[1];
    if (arg.startsWith("--fullName=")) parsed.fullName = arg.split("=")[1];
    if (arg.startsWith("--email=")) parsed.email = arg.split("=")[1];
    if (arg.startsWith("--password=")) parsed.password = arg.split("=")[1];
  }

  return parsed;
};

async function main() {
  await dbConnection();

  const args = parseArgs(process.argv.slice(2));

  if (!args.create && !args.phone && !args.id) {
    usage();
    process.exit(1);
  }

  let user = null;

  if (args.create) {
    if (!args.fullName || !args.phone || !args.password) {
      console.error("--create requires --fullName, --phone, and --password");
      process.exit(3);
    }

    user = await User.findOne({ phoneNumber: args.phone });

    if (user) {
      console.log(`User already exists for phone ${args.phone}; promoting that account to admin.`);
    } else {
      const existingEmail = args.email ? await User.findOne({ email: args.email.toLowerCase() }) : null;

      if (existingEmail) {
        console.error("Email is already registered");
        process.exit(4);
      }

      user = await User.create({
        fullName: args.fullName,
        phoneNumber: args.phone,
        email: args.email || undefined,
        password: args.password,
        upiId: `admin${args.phone}@ptm`,
        qrCode: `QR_${Date.now()}`,
        isVerified: true,
        isAdmin: true
      });

      await Wallet.create({
        userId: user._id,
        balance: 0
      });

      console.log(`Created new admin account for ${user.fullName} (${user.phoneNumber})`);
      process.exit(0);
    }
  } else if (args.phone) {
    user = await User.findOne({ phoneNumber: args.phone });
  } else if (args.id) {
    user = await User.findById(args.id);
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
