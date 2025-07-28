// prisma/seed.js
import prisma from '../src/prisma.js'; 

async function main() {
  // 🧍 User 1
  let user1 = await prisma.user.findUnique({ where: { username: 'anthony' } });
  if (!user1) {
    user1 = await prisma.user.create({
      data: {
        username: 'anthony',
        email: 'anthony@example.com',
        password: 'hashedpass123',
        skillLevel: 4,
        position: 'Guard',
        isPremium: true,
        profile: {
          create: {
            bio: '🏀 I live on the court.',
            imageUrl: 'https://example.com/avatar1.png'
          }
        }
      }
    });
    console.log('✅ User "anthony" angelegt');
  }

  // 🧍 User 2
  let user2 = await prisma.user.findUnique({ where: { username: 'lisa' } });
  if (!user2) {
    user2 = await prisma.user.create({
      data: {
        username: 'lisa',
        email: 'lisa@example.com',
        password: 'hashedpass456',
        skillLevel: 2,
        position: 'Forward',
        isPremium: false
      }
    });
    console.log('✅ User "lisa" angelegt');
  }

  // 🏀 Courts
  const [court1, court2] = await Promise.all([
    prisma.court.upsert({
      where: { name: 'Downtown Court' },
      update: {},
      create: {
        name: 'Downtown Court',
        address: 'Main St 123',
        city: 'Ljubljana',
        isIndoor: false
      }
    }),
    prisma.court.upsert({
      where: { name: 'Elite Gym Hall' },
      update: {},
      create: {
        name: 'Elite Gym Hall',
        address: 'Arena Blvd 5',
        city: 'Maribor',
        isIndoor: true
      }
    })
  ]);
  console.log('✅ Courts angelegt');

  // 🛡️ Teams
  const teamA = await prisma.team.upsert({
    where: { name: 'Hoop Warriors' },
    update: {},
    create: {
      name: 'Hoop Warriors',
      location: 'Ihova',
      logo: 'https://example.com/logo1.png'
    }
  });

  const teamB = await prisma.team.upsert({
    where: { name: 'Court Kings' },
    update: {},
    create: {
      name: 'Court Kings',
      location: 'Benedikt',
      logo: 'https://example.com/logo2.png'
    }
  });
  console.log('✅ Teams angelegt');

  // 👥 TeamMembers (nur hinzufügen wenn nicht vorhanden)
  const existingMemberships = await prisma.teamMember.findMany({
    where: {
      OR: [
        { userId: user1.id, teamId: teamA.id },
        { userId: user2.id, teamId: teamB.id }
      ]
    }
  });

  if (existingMemberships.length === 0) {
    await prisma.teamMember.create({
      data: {
        userId: user1.id,
        teamId: teamA.id,
        role: 'Captain'
      }
    });
    await prisma.teamMember.create({
      data: {
        userId: user2.id,
        teamId: teamB.id,
        role: 'Player'
      }
    });
    console.log('✅ Team-Mitglieder hinzugefügt');
  }

  // 🗓️ Game
  const existingGame = await prisma.game.findFirst({
    where: { title: 'Evening Showdown' }
  });

  if (!existingGame) {
    await prisma.game.create({
      data: {
        title: 'Evening Showdown',
        date: new Date('2025-06-23T18:00:00'),
        time: '18:00',
        location: court1.name,
        maxPlayers: 10,
        skillLevel: 'All Levels',
        description: 'Open run for everyone',
        isPublic: true,
        courtId: court1.id,
        organizerId: user1.id,
        teamAId: teamA.id,
        teamBId: teamB.id,
        result: 'Team A gewinnt',
        score: [5, 3], // 👈 You can also use: { teamA: 5, teamB: 3 }
    
        participants: {
          create: [
            { user: { connect: { id: user1.id } }, team: 'A' },
            { user: { connect: { id: user2.id } }, team: 'B' }
          ]
        }
      }
    });
    
    console.log('✅ Game erstellt');
  }
  

  // 🎯 Rating
  const ratingExists = await prisma.rating.findFirst({
    where: {
      raterId: user2.id,
      ratedId: user1.id
    }
  });

  if (!ratingExists) {
    await prisma.rating.create({
      data: {
        score: 5,
        comment: 'Great teammate!',
        raterId: user2.id,
        ratedId: user1.id
      }
    });
    console.log('✅ Rating erstellt');
  }

  // 🏆 Tournament
  const tournamentExists = await prisma.tournament.findFirst({
    where: { title: 'Slovenia Summer Cup' }
  });

  if (!tournamentExists) {
    await prisma.tournament.create({
      data: {
        title: 'Slovenia Summer Cup',
        organizer: 'basketballconnect',
        date: new Date('2025-07-10'),
        format: 'Knockout',
        location: 'Ljubljana Arena',
        entryFee: '€20',
        prizes: 'Trophy & gear',
        teams: {
          connect: [{ id: teamA.id }, { id: teamB.id }]
        }
      }
    });
    console.log('✅ Tournament erstellt');
  }
}

main()
  .then(() => {
    console.log('\n🎉 Seed abgeschlossen ohne Duplikate.');
  })
  .catch((e) => {
    console.error('❌ Fehler beim Seeden:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
