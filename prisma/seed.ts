import { prisma } from "../src/lib/prisma";

const categories = [
  // 1. Elektronik & Gadget
  { id: "elektronik", name: "Elektronik & Gadget", parent_id: null },
  { id: "elektronik-smartphone", name: "Smartphone & HP", parent_id: "elektronik" },
  { id: "elektronik-laptop", name: "Laptop & Ultrabook", parent_id: "elektronik" },
  { id: "elektronik-tablet", name: "Tablet & iPad", parent_id: "elektronik" },
  { id: "elektronik-smartwatch", name: "Smartwatch & Smartband", parent_id: "elektronik" },
  { id: "elektronik-kamera", name: "Kamera DSLR & Mirrorless", parent_id: "elektronik" },
  { id: "elektronik-audio", name: "Headphone, TWS & Earphone", parent_id: "elektronik" },
  { id: "elektronik-tv", name: "Smart TV & Televisi LED", parent_id: "elektronik" },
  { id: "elektronik-speaker", name: "Speaker Bluetooth Portable", parent_id: "elektronik" },
  { id: "elektronik-gaming", name: "Konsol Game (PlayStation/Switch)", parent_id: "elektronik" },
  { id: "elektronik-monitor", name: "Monitor Komputer & PC", parent_id: "elektronik" },

  // 2. Makanan & Camilan
  { id: "makanan", name: "Makanan & Camilan", parent_id: null },
  { id: "makanan-snack", name: "Makanan Ringan & Snack Keripik", parent_id: "makanan" },
  { id: "makanan-mie-instan", name: "Mie Instan & Ramen", parent_id: "makanan" },
  { id: "makanan-kaleng", name: "Makanan Kaleng & Sarden", parent_id: "makanan" },
  { id: "makanan-frozen", name: "Frozen Food & Nugget", parent_id: "makanan" },
  { id: "makanan-roti", name: "Roti, Biskuit & Kue", parent_id: "makanan" },
  { id: "makanan-cokelat", name: "Cokelat Batang & Permen", parent_id: "makanan" },
  { id: "makanan-sereal", name: "Sereal Sarapan & Granola", parent_id: "makanan" },
  { id: "makanan-sambal", name: "Sambal Kemasan & Saus Cabai", parent_id: "makanan" },
  { id: "makanan-bumbu", name: "Bumbu Masak & Rempah Dapur", parent_id: "makanan" },
  { id: "makanan-beras", name: "Beras Organik & Gandum", parent_id: "makanan" },

  // 3. Minuman & Kopi
  { id: "minuman", name: "Minuman & Kopi", parent_id: null },
  { id: "minuman-kopi-biji", name: "Kopi Biji & Kopi Bubuk Arabika", parent_id: "minuman" },
  { id: "minuman-teh", name: "Teh Celup & Teh Herbal", parent_id: "minuman" },
  { id: "minuman-susu-uht", name: "Susu UHT & Susu Segar", parent_id: "minuman" },
  { id: "minuman-jus", name: "Jus Buah Kemasan Alami", parent_id: "minuman" },
  { id: "minuman-air-mineral", name: "Air Mineral Galon & Botol", parent_id: "minuman" },
  { id: "minuman-soda", name: "Minuman Bersoda & Berkarbonasi", parent_id: "minuman" },
  { id: "minuman-isotonik", name: "Minuman Isotonik & Elektrolit", parent_id: "minuman" },
  { id: "minuman-sirup", name: "Sirup Aneka Rasa", parent_id: "minuman" },
  { id: "minuman-cokelat-bubuk", name: "Minuman Cokelat & Matcha Bubuk", parent_id: "minuman" },
  { id: "minuman-jamu", name: "Minuman Tradisional & Jamu Herbal", parent_id: "minuman" },

  // 4. Pakaian Pria
  { id: "pakaian-pria", name: "Pakaian Pria", parent_id: null },
  { id: "pria-kaos", name: "Kaos Polos & Kaos Grafis", parent_id: "pakaian-pria" },
  { id: "pria-kemeja", name: "Kemeja Formal & Kasual", parent_id: "pakaian-pria" },
  { id: "pria-jaket", name: "Jaket Bomber & Hoodie", parent_id: "pakaian-pria" },
  { id: "pria-jeans", name: "Celana Denim Jeans", parent_id: "pakaian-pria" },
  { id: "pria-chino", name: "Celana Panjang Chino", parent_id: "pakaian-pria" },
  { id: "pria-jas", name: "Jas Formal & Blazer Pria", parent_id: "pakaian-pria" },
  { id: "pria-celana-pendek", name: "Celana Pendek Santai", parent_id: "pakaian-pria" },
  { id: "pria-sweater", name: "Sweater Rajut & Cardigan Pria", parent_id: "pakaian-pria" },
  { id: "pria-batik", name: "Kemeja Batik Pria", parent_id: "pakaian-pria" },
  { id: "pria-underwear", name: "Pakaian Dalam & Singlet Pria", parent_id: "pakaian-pria" },

  // 5. Pakaian Wanita
  { id: "pakaian-wanita", name: "Pakaian Wanita", parent_id: null },
  { id: "wanita-blouse", name: "Blouse & Kemeja Wanita", parent_id: "pakaian-wanita" },
  { id: "wanita-dress", name: "Dress & Gaun Pesta", parent_id: "pakaian-wanita" },
  { id: "wanita-rok", name: "Rok Plisket & Rok Panjang", parent_id: "pakaian-wanita" },
  { id: "wanita-kulot", name: "Celana Kulot Wanita", parent_id: "pakaian-wanita" },
  { id: "wanita-hijab", name: "Hijab Segi Empat & Pashmina", parent_id: "pakaian-wanita" },
  { id: "wanita-gamis", name: "Gamis & Abaya Muslimah", parent_id: "pakaian-wanita" },
  { id: "wanita-outer", name: "Cardigan & Outerwear Wanita", parent_id: "pakaian-wanita" },
  { id: "wanita-kaos", name: "Kaos Wanita Kasual", parent_id: "pakaian-wanita" },
  { id: "wanita-kebaya", name: "Kebaya Modern & Wisuda", parent_id: "pakaian-wanita" },
  { id: "wanita-piyama", name: "Piyama & Baju Tidur Wanita", parent_id: "pakaian-wanita" },

  // 6. Kecantikan & Skincare
  { id: "kecantikan", name: "Kecantikan & Skincare", parent_id: null },
  { id: "beauty-facial-wash", name: "Sabun Cuci Muka (Facial Wash)", parent_id: "kecantikan" },
  { id: "beauty-toner", name: "Toner & Essence Wajah", parent_id: "kecantikan" },
  { id: "beauty-serum", name: "Serum Vitamin C & Niacinamide", parent_id: "kecantikan" },
  { id: "beauty-moisturizer", name: "Pelembab Wajah (Moisturizer)", parent_id: "kecantikan" },
  { id: "beauty-sunscreen", name: "Sunscreen SPF 50+", parent_id: "kecantikan" },
  { id: "beauty-lipstik", name: "Lipstik, Lip Tint & Lip Balm", parent_id: "kecantikan" },
  { id: "beauty-cushion", name: "Cushion & Foundation Bedak", parent_id: "kecantikan" },
  { id: "beauty-masker", name: "Sheet Mask & Clay Mask Wajah", parent_id: "kecantikan" },
  { id: "beauty-body-wash", name: "Sabun Mandi Cair & Body Scrub", parent_id: "kecantikan" },
  { id: "beauty-sampo", name: "Sampo Anti Ketombe & Kondisioner", parent_id: "kecantikan" },

  // 7. Kesehatan & Medis
  { id: "kesehatan", name: "Kesehatan & Suplemen", parent_id: null },
  { id: "health-vitamin-c", name: "Vitamin C & Multivitamin Harian", parent_id: "kesehatan" },
  { id: "health-imun", name: "Suplemen Peningkat Imun Tubuh", parent_id: "kesehatan" },
  { id: "health-masker", name: "Masker Medis 3-Ply & KN95", parent_id: "kesehatan" },
  { id: "health-obat-flu", name: "Obat Flu, Batuk & Demam", parent_id: "kesehatan" },
  { id: "health-minyak-angin", name: "Minyak Angin Aromaterapi & Kayu Putih", parent_id: "kesehatan" },
  { id: "health-termometer", name: "Termometer Digital Tubuh", parent_id: "kesehatan" },
  { id: "health-p3k", name: "Kotak P3K & Perban Darurat", parent_id: "kesehatan" },
  { id: "health-plester", name: "Plester Luka & Kasa Steril", parent_id: "kesehatan" },
  { id: "health-antiseptik", name: "Antiseptik & Hand Sanitizer", parent_id: "kesehatan" },
  { id: "health-madu", name: "Madu Murni Alami", parent_id: "kesehatan" },

  // 8. Peralatan Dapur & Rumah Tangga
  { id: "peralatan-rumah", name: "Peralatan Dapur & Rumah Tangga", parent_id: null },
  { id: "home-wajan", name: "Wajan Teflon & Panci Masak", parent_id: "peralatan-rumah" },
  { id: "home-pisau", name: "Set Pisau Dapur & Talenan Kayu", parent_id: "peralatan-rumah" },
  { id: "home-piring", name: "Set Piring & Mangkuk Keramik", parent_id: "peralatan-rumah" },
  { id: "home-blender", name: "Blender & Food Processor", parent_id: "peralatan-rumah" },
  { id: "home-rice-cooker", name: "Rice Cooker Digital Penanak Nasi", parent_id: "peralatan-rumah" },
  { id: "home-dispenser", name: "Dispenser Air Galon Bawah", parent_id: "peralatan-rumah" },
  { id: "home-sapu-pel", name: "Set Sapu & Alat Pel Putar", parent_id: "peralatan-rumah" },
  { id: "home-hanger", name: "Gantungan Baju & Rak Jemuran", parent_id: "peralatan-rumah" },
  { id: "home-food-container", name: "Kotak Makan & Wadah Kedap Udara", parent_id: "peralatan-rumah" },
  { id: "home-pompa-galon", name: "Pompa Galon Elektrik Otomatis", parent_id: "peralatan-rumah" },

  // 9. Olahraga & Aktivitas Outdoor
  { id: "olahraga", name: "Olahraga & Aktivitas Outdoor", parent_id: null },
  { id: "sport-sepatu-lari", name: "Sepatu Lari (Running Shoes)", parent_id: "olahraga" },
  { id: "sport-matras-yoga", name: "Matras Yoga Anti Selip", parent_id: "olahraga" },
  { id: "sport-dumbbell", name: "Set Dumbbell & Barbell Fitness", parent_id: "olahraga" },
  { id: "sport-jersey", name: "Jersey Sepak Bola & Futsal", parent_id: "olahraga" },
  { id: "sport-raket", name: "Raket Bulutangkis & Shuttlecock", parent_id: "olahraga" },
  { id: "sport-sepeda", name: "Sepeda Gunung (MTB) & Lipat", parent_id: "olahraga" },
  { id: "sport-tenda", name: "Tenda Camping Dome 4 Orang", parent_id: "olahraga" },
  { id: "sport-carrier", name: "Tas Gunung Carrier 60 Liter", parent_id: "olahraga" },
  { id: "sport-kacamata-renang", name: "Kacamata Renang Anti Fog", parent_id: "olahraga" },
  { id: "sport-tumbler", name: "Botol Minum Olahraga (Tumbler)", parent_id: "olahraga" },

  // 10. Buku & Alat Tulis Kantor
  { id: "buku-alat-tulis", name: "Buku & Alat Tulis Kantor", parent_id: null },
  { id: "buku-pemrograman", name: "Buku Belajar Pemrograman & IT", parent_id: "buku-alat-tulis" },
  { id: "buku-novel", name: "Novel Fiksi & Sastra Populer", parent_id: "buku-alat-tulis" },
  { id: "buku-self-improvement", name: "Buku Pengembangan Diri (Self Help)", parent_id: "buku-alat-tulis" },
  { id: "buku-bisnis", name: "Buku Bisnis, Investasi & Finansial", parent_id: "buku-alat-tulis" },
  { id: "buku-bahasa", name: "Kamus & Buku Belajar Bahasa Asing", parent_id: "buku-alat-tulis" },
  { id: "buku-pelajaran", name: "Buku Pelajaran Sekolah & Ensiklopedia", parent_id: "buku-alat-tulis" },
  { id: "atk-pulpen", name: "Pulpen Gel & Bolpoin Kantor", parent_id: "buku-alat-tulis" },
  { id: "atk-notebook", name: "Buku Catatan Spiral & Jurnal", parent_id: "buku-alat-tulis" },
  { id: "atk-kertas-hvs", name: "Kertas HVS A4 80 GSM", parent_id: "buku-alat-tulis" },
  { id: "atk-pensil-warna", name: "Set Pensil Warna & Crayon Gambar", parent_id: "buku-alat-tulis" },
];

async function main() {
  console.log("Seeding 110 categories...");
  await prisma.category.deleteMany();
  await prisma.category.createMany({
    data: categories,
  });
  console.log("Successfully seeded 110 categories!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
