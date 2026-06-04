import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { defaultDashboardData } from './defaultDashboardData.js';
import { seedUserDashboard } from './seedUserDashboard.js';

dotenv.config();

const demoUsers = [
  { role: 'asu', email: 'asu@asu-yaso.app', password: 'AsuYaso123!' },
  { role: 'yaso', email: 'yaso@asu-yaso.app', password: 'YasoAsu123!' },
];

const seed = async () => {
  await connectDB();

  for (const demo of demoUsers) {
    const defaults = defaultDashboardData[demo.role].user;
    let user = await User.findOne({ email: demo.email });

    if (!user) {
      user = await User.create({
        ...defaults,
        email: demo.email,
        password: demo.password,
        role: demo.role,
      });
      console.log(`Created ${demo.role} demo user`);
    }

    await seedUserDashboard(user);
    console.log(`Seeded dashboard data for ${demo.role}`);
  }

  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
