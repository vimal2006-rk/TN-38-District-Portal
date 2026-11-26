const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ─── Data ────────────────────────────────────────────────────────────────────

const roles = [
  { id: 1, name: 'SUPER_ADMIN' },
  { id: 2, name: 'DISTRICT_ADMIN' },
];

const districts = [
  { nameEn: 'Ariyalur',        nameTa: 'அரியலூர்',           slug: 'ariyalur' },
  { nameEn: 'Chengalpattu',    nameTa: 'செங்கல்பட்டு',       slug: 'chengalpattu' },
  { nameEn: 'Chennai',         nameTa: 'சென்னை',             slug: 'chennai' },
  { nameEn: 'Coimbatore',      nameTa: 'கோயம்புத்தூர்',      slug: 'coimbatore' },
  { nameEn: 'Cuddalore',       nameTa: 'கடலூர்',             slug: 'cuddalore' },
  { nameEn: 'Dharmapuri',      nameTa: 'தர்மபுரி',           slug: 'dharmapuri' },
  { nameEn: 'Dindigul',        nameTa: 'டிண்டுக்கல்',        slug: 'dindigul' },
  { nameEn: 'Erode',           nameTa: 'ஈரோடு',              slug: 'erode' },
  { nameEn: 'Kallakurichi',    nameTa: 'கள்ளக்குறிச்சி',     slug: 'kallakurichi' },
  { nameEn: 'Kancheepuram',    nameTa: 'காஞ்சிபுரம்',        slug: 'kancheepuram' },
  { nameEn: 'Karur',           nameTa: 'கரூர்',              slug: 'karur' },
  { nameEn: 'Krishnagiri',     nameTa: 'கிருஷ்ணகிரி',        slug: 'krishnagiri' },
  { nameEn: 'Madurai',         nameTa: 'மதுரை',              slug: 'madurai' },
  { nameEn: 'Mayiladuthurai',  nameTa: 'மயிலாடுதுறை',       slug: 'mayiladuthurai' },
  { nameEn: 'Nagapattinam',    nameTa: 'நாகப்பட்டினம்',      slug: 'nagapattinam' },
  { nameEn: 'Kanniyakumari',   nameTa: 'கன்னியாகுமரி',       slug: 'kanniyakumari' },
  { nameEn: 'Namakkal',        nameTa: 'நாமக்கல்',           slug: 'namakkal' },
  { nameEn: 'Perambalur',      nameTa: 'பெரம்பலூர்',         slug: 'perambalur' },
  { nameEn: 'Pudukkottai',     nameTa: 'புதுக்கோட்டை',       slug: 'pudukkottai' },
  { nameEn: 'Ramanathapuram',  nameTa: 'இராமநாதபுரம்',       slug: 'ramanathapuram' },
  { nameEn: 'Ranipet',         nameTa: 'ராணிப்பேட்டை',       slug: 'ranipet' },
  { nameEn: 'Salem',           nameTa: 'சேலம்',              slug: 'salem' },
  { nameEn: 'Sivaganga',       nameTa: 'சிவகங்கை',           slug: 'sivaganga' },
  { nameEn: 'Tenkasi',         nameTa: 'தென்காசி',           slug: 'tenkasi' },
  { nameEn: 'Thanjavur',       nameTa: 'தஞ்சாவூர்',          slug: 'thanjavur' },
  { nameEn: 'Theni',           nameTa: 'தேனி',               slug: 'theni' },
  { nameEn: 'Thoothukudi',     nameTa: 'தூத்துக்குடி',       slug: 'thoothukudi' },
  { nameEn: 'Tiruchirappalli', nameTa: 'திருச்சிராப்பள்ளி',  slug: 'tiruchirappalli' },
  { nameEn: 'Tirunelveli',     nameTa: 'திருநெல்வேலி',       slug: 'tirunelveli' },
  { nameEn: 'Tirupathur',      nameTa: 'திருப்பத்தூர்',      slug: 'tirupathur' },
  { nameEn: 'Tiruppur',        nameTa: 'திருப்பூர்',         slug: 'tiruppur' },
  { nameEn: 'Tiruvallur',      nameTa: 'திருவள்ளூர்',        slug: 'tiruvallur' },
  { nameEn: 'Tiruvannamalai',  nameTa: 'திருவண்ணாமலை',       slug: 'tiruvannamalai' },
  { nameEn: 'Tiruvarur',       nameTa: 'திருவாரூர்',         slug: 'tiruvarur' },
  { nameEn: 'Vellore',         nameTa: 'வேலூர்',             slug: 'vellore' },
  { nameEn: 'Viluppuram',      nameTa: 'விழுப்புரம்',        slug: 'viluppuram' },
  { nameEn: 'Virudhunagar',    nameTa: 'விருதுநகர்',         slug: 'virudhunagar' },
  { nameEn: 'The Nilgiris',    nameTa: 'நீலகிரி',            slug: 'the-nilgiris' },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Starting seed...');

  // 1. Roles
  console.log('  → Seeding roles...');
  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: { name: role.name },
      create: { id: role.id, name: role.name },
    });
  }
  console.log(`     ✔ ${roles.length} roles seeded`);

  // 2. Super Admin user (from env or default)
  console.log('  → Seeding super admin user...');
  const seedEmail = (process.env.ADMIN_SEED_EMAIL || 'admin@tnmssa.com').trim().toLowerCase();
  const seedPassword = process.env.ADMIN_SEED_PASSWORD || 'TmssaAdmin@2026';
  const passwordHash = await bcrypt.hash(seedPassword, 12);
  await prisma.user.upsert({
    where: { email: seedEmail },
    update: {},
    create: {
      name: 'TMSSA Super Admin',
      email: seedEmail,
      passwordHash,
      roleId: 1,
      isActive: true,
    },
  });
  console.log(`     ✔ Super admin user seeded (${seedEmail})`);

  // 3. Districts
  console.log('  → Seeding districts...');
  for (const district of districts) {
    await prisma.district.upsert({
      where: { slug: district.slug },
      update: { nameEn: district.nameEn, nameTa: district.nameTa },
      create: {
        nameEn: district.nameEn,
        nameTa: district.nameTa,
        slug: district.slug,
        isActive: true,
      },
    });
  }
  console.log(`     ✔ ${districts.length} districts seeded`);

  // 4. WhatsApp groups (one per district)
  console.log('  → Seeding WhatsApp groups...');
  for (const district of districts) {
    const districtRecord = await prisma.district.findUnique({
      where: { slug: district.slug },
    });

    if (!districtRecord) continue;

    await prisma.whatsappGroup.upsert({
      where: { districtId: districtRecord.id },
      update: {
        groupName: `${district.nameEn} District WhatsApp Group`,
        inviteLink: `https://chat.whatsapp.com/placeholder-${district.slug}`,
      },
      create: {
        districtId: districtRecord.id,
        groupName: `${district.nameEn} District WhatsApp Group`,
        inviteLink: `https://chat.whatsapp.com/placeholder-${district.slug}`,
        isActive: true,
      },
    });
  }
  console.log(`     ✔ ${districts.length} WhatsApp groups seeded`);

  console.log('🎉  Seed completed successfully!');
}

// ─── Run ──────────────────────────────────────────────────────────────────────

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
