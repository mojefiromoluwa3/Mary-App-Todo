const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create demo user if not exists
  const hashedPassword = await bcrypt.hash("password123", 10);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@focusflow.com" },
    update: {},
    create: {
      email: "demo@focusflow.com",
      name: "Alex Morgan",
      password: hashedPassword,
      theme: "system",
      emailNotifications: true,
    },
  });

  console.log(`Demo user ID: ${demoUser.id}`);

  // Create demo categories
  const categoriesData = [
    { name: "Work", color: "#3B82F6" },
    { name: "Personal", color: "#10B981" },
    { name: "Health", color: "#F59E0B" },
    { name: "Learning", color: "#8B5CF6" },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    let category = await prisma.category.findFirst({
      where: { name: cat.name, userId: demoUser.id },
    });
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: cat.name,
          color: cat.color,
          userId: demoUser.id,
        },
      });
    }
    categories.push(category);
  }

  // Create demo tasks if user has none
  const taskCount = await prisma.task.count({
    where: { userId: demoUser.id },
  });

  if (taskCount === 0) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 5);

    await prisma.task.createMany({
      data: [
        {
          title: "Complete quarterly product roadmap",
          description: "Review feature requests and prepare Q4 priorities document.",
          priority: "HIGH",
          status: "IN_PROGRESS",
          dueDate: today,
          dueTime: "15:00",
          isImportant: true,
          userId: demoUser.id,
          categoryId: categories[0]?.id,
        },
        {
          title: "Review pull requests for authentication module",
          description: "Inspect credentials provider and JWT session verification.",
          priority: "URGENT",
          status: "TODO",
          dueDate: today,
          dueTime: "17:30",
          isImportant: true,
          userId: demoUser.id,
          categoryId: categories[0]?.id,
        },
        {
          title: "Grocery shopping & meal prep",
          description: "Buy fresh vegetables, fruits, and snacks for the week.",
          priority: "MEDIUM",
          status: "TODO",
          dueDate: tomorrow,
          dueTime: "11:00",
          isImportant: false,
          userId: demoUser.id,
          categoryId: categories[1]?.id,
        },
        {
          title: "Finish reading System Design chapter 4",
          description: "Focus on caching strategies and distributed database consensus.",
          priority: "LOW",
          status: "COMPLETED",
          dueDate: today,
          dueTime: "09:00",
          isImportant: false,
          userId: demoUser.id,
          categoryId: categories[3]?.id,
        },
      ],
    });
    console.log("Demo tasks created.");
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
