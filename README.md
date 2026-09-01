# Bio-Genius Optimizer

Bio-Genius Optimizer adalah aplikasi dashboard berbasis web untuk monitoring dan optimasi parameter tekanan pada plant Bio-CNG. Aplikasi ini menyediakan login operator, pemantauan tekanan kompresor, grafik riwayat tekanan, histori alert, simulasi anomali, tindakan stabilisasi, serta AI Virtual Consultant untuk membantu operator membaca kondisi sistem dan menentukan rekomendasi tindakan.

Dokumen deskripsi akademik dan pemetaan bobot RPS Kecerdasan Buatan IFB305 serta Computer Vision IFB301 tersedia di [docs/APPLICATION_DESCRIPTION.md](docs/APPLICATION_DESCRIPTION.md).

## Getting Started

Jalankan development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Menjalankan modul APD YOLO

Terminal kedua untuk backend computer vision:

```bash
pip install -r python/requirements.txt
npm run api
```

Backend sekarang otomatis mengunduh model publik Hugging Face `hf://Hexmon/vyra-yolo-ppe-detection/best.pt` ke cache lokal pada run pertama. Kalau kamu punya weights APD sendiri, set `YOLO_WEIGHTS_PATH` ke path lokal file `.pt` itu untuk override.

Credential demo:

- Username: `admin`
- Password: `admin123`

## Fitur

- Monitoring tekanan kompresor dan status sistem.
- Grafik riwayat tekanan secara real-time.
- Histori alert untuk gangguan dan tindakan operator.
- Simulasi anomali tekanan untuk training mode.
- Tindakan mitigasi untuk stabilisasi tekanan.
- AI Virtual Consultant berbasis simulasi untuk analisis kondisi dan rekomendasi.

## Relevansi Mata Kuliah

Aplikasi ini paling kuat mendukung mata kuliah Kecerdasan Buatan IFB305 pada aspek analisis masalah, reasoning, rekomendasi tindakan, dan integrasi konsep AI. Aplikasi juga relevan dengan Computer Vision IFB301 sebagai rancangan pengembangan lanjutan untuk inspeksi visual plant berbasis citra/video, segmentasi, ekstraksi fitur, dan object detection/classification.

Ringkasan bobot utama:

- Kecerdasan Buatan IFB305: CPMK 1 60%, CPMK 2 40%, CPL-2 27%, CPL-8 46%, CPL-10 27%.
- Computer Vision IFB301: CPMK 1 45%, CPMK 2 55%, CPL-2 29%, CPL-8 30%, CPL-9 41%.

Detail pemetaan SubCPMK dan CPL ada pada dokumen deskripsi aplikasi.
