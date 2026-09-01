# Deskripsi Aplikasi Bio-Genius Optimizer

## Ringkasan Aplikasi

Bio-Genius Optimizer adalah aplikasi dashboard berbasis web untuk membantu operator memantau dan mengoptimalkan parameter tekanan pada plant Bio-CNG. Aplikasi ini menyediakan tampilan monitoring tekanan kompresor, grafik riwayat tekanan secara real-time, histori alert, simulasi anomali, tindakan stabilisasi, serta AI Virtual Consultant yang memberikan analisis kondisi sistem dan rekomendasi tindakan operasional.

Secara akademik, aplikasi ini berada pada irisan mata kuliah Kecerdasan Buatan dan Computer Vision karena menggabungkan konsep pemantauan data industri, deteksi kondisi tidak normal, rekomendasi berbasis aturan, dan rancangan pengembangan sistem cerdas untuk kebutuhan industri. Implementasi saat ini menggabungkan aspek Kecerdasan Buatan dan Computer Vision melalui monitoring tekanan, pipeline keputusan AI, inspeksi visual plant, video monitoring, deteksi objek, dan inspeksi kondisi perangkat.

## Fitur Utama

1. Login operator untuk membatasi akses ke dashboard monitoring.
2. Dashboard tekanan kompresor dengan nilai tekanan, status sistem, dan grafik riwayat.
3. Histori alert untuk mencatat gangguan, pemeriksaan sistem, dan tindakan operator.
4. Simulasi anomali tekanan untuk kebutuhan training mode dan pengujian respons sistem.
5. Tindakan mitigasi untuk mengembalikan tekanan ke nilai stabil.
6. AI Virtual Consultant yang menjawab pertanyaan operator mengenai kondisi tekanan, risiko, hasil computer vision, dan rekomendasi tindakan.
7. Dashboard Visual Inspection untuk preprocessing citra, segmentasi komponen, ekstraksi fitur, motion tracking, dan object detection/classification.
8. Pipeline AI terpadu yang memuat heuristic search, fuzzy reasoning, constraint-based planning, prediksi anomali, dan log observasi sistem.

## Relevansi Mata Kuliah Kecerdasan Buatan IFB305

Bobot utama dari sisi Kecerdasan Buatan mengacu pada CPMK berikut:

| CPMK | Bobot | Keterkaitan dengan Aplikasi |
| --- | ---: | --- |
| CPMK 1 | 60% | Aplikasi menganalisis masalah operasional berupa tekanan kompresor tidak normal, mengidentifikasi status sistem, dan memberikan rekomendasi berbasis logika AI sederhana melalui AI Virtual Consultant. |
| CPMK 2 | 40% | Aplikasi menerapkan konsep kecerdasan buatan dalam bentuk reasoning berbasis kondisi, respons terhadap input operator, dan simulasi tindakan stabilisasi sistem. |

Pemetaan SubCPMK Kecerdasan Buatan:

| SubCPMK | Bobot | Implementasi/Relevansi |
| --- | ---: | --- |
| SubCPMK 1 | 6% | Memuat konsep dasar AI melalui chatbot konsultatif yang menjelaskan status sistem. |
| SubCPMK 2 | 14% | Diimplementasikan melalui heuristic search untuk strategi pencarian solusi operasional, misalnya menentukan langkah mitigasi terbaik ketika tekanan naik atau turun. |
| SubCPMK 3 | 14% | Diimplementasikan melalui fuzzy reasoning berbasis aturan untuk membedakan kondisi off, normal, underpressure, dan overpressure. |
| SubCPMK 4 | 14% | Diimplementasikan pada perencanaan tindakan berbasis constraint, seperti stabilisasi tekanan dan simulasi skenario gangguan. |
| SubCPMK 5 | 14% | Diimplementasikan sebagai model prediktif sederhana berbasis tren historis untuk prediksi anomali dari data historis sensor. |
| SubCPMK 6 | 38% | Paling kuat karena aplikasi mengintegrasikan monitoring, reasoning, rekomendasi tindakan, dan kerja sistem berbasis proyek. |

Komposisi CPL pada mata kuliah Kecerdasan Buatan:

| CPL | Bobot | Kontribusi Aplikasi |
| --- | ---: | --- |
| CPL-2 | 27% | Mendukung kerja tim melalui skenario proyek dashboard, pembagian peran operator, pengembang, dan analis sistem. |
| CPL-8 | 46% | Menjadi pusat aplikasi karena sistem mengidentifikasi masalah berbasis data tekanan dan mengusulkan solusi perangkat lunak cerdas. |
| CPL-10 | 27% | Menerapkan dasar computing, logika kondisi, struktur data riwayat, dan konsep pengembangan perangkat lunak. |

## Relevansi Mata Kuliah Computer Vision IFB301

Bobot dari sisi Computer Vision mengacu pada CPMK berikut:

| CPMK | Bobot | Keterkaitan dengan Aplikasi |
| --- | ---: | --- |
| CPMK 1 | 45% | Aplikasi dapat dikembangkan untuk mengidentifikasi masalah visual di lingkungan plant Bio-CNG, seperti kondisi panel, pipa, kebocoran visual, atau status perangkat dari kamera industri. |
| CPMK 2 | 55% | Aplikasi dapat diperluas dengan modul pra-pemrosesan citra, segmentasi, ekstraksi fitur, serta deteksi atau klasifikasi objek untuk inspeksi visual plant. |

Pemetaan SubCPMK Computer Vision:

| SubCPMK | Bobot | Implementasi/Relevansi |
| --- | ---: | --- |
| SubCPMK 1 | 14% | Diimplementasikan untuk peningkatan kualitas citra kamera plant melalui filtering, enhancement, dan restoration sebelum analisis visual. |
| SubCPMK 2 | 12% | Diimplementasikan untuk segmentasi area penting, misalnya pipa, valve, gauge, atau komponen kompresor. |
| SubCPMK 3 | 21% | Diimplementasikan untuk ekstraksi fitur warna, tekstur, bentuk, atau orientasi pada komponen plant. |
| SubCPMK 4 | 10% | Diimplementasikan untuk pemantauan video, tracking gerakan, dan analisis aktivitas operasional berbasis kamera. |
| SubCPMK 5 | 43% | Diimplementasikan sebagai prioritas terbesar melalui object detection/classification berbasis machine learning atau deep learning, misalnya YOLO atau CNN untuk inspeksi perangkat Bio-CNG. |

Komposisi CPL pada mata kuliah Computer Vision:

| CPL | Bobot | Kontribusi Aplikasi |
| --- | ---: | --- |
| CPL-2 | 29% | Mendukung kerja kolaboratif dalam perancangan modul inspeksi visual dan analisis hasil deteksi. |
| CPL-8 | 30% | Mendukung identifikasi masalah industri berbasis citra atau video. |
| CPL-9 | 41% | Mendukung perancangan dan pembangunan perangkat lunak lintas platform untuk monitoring visual, dashboard, dan analisis AI. |

## Ringkasan Bobot Gabungan

| Mata Kuliah | Fokus Utama | Bobot Paling Relevan |
| --- | --- | --- |
| Kecerdasan Buatan IFB305 | Analisis masalah, reasoning, rekomendasi tindakan, integrasi sistem AI | SubCPMK 6: 38%, CPMK 1: 60%, CPL-8: 46% |
| Computer Vision IFB301 | Rancangan inspeksi visual, pengolahan citra/video, object detection | SubCPMK 5: 43%, CPMK 2: 55%, CPL-9: 41% |

## Deskripsi Singkat untuk Proposal

Bio-Genius Optimizer adalah aplikasi monitoring dan optimasi plant Bio-CNG berbasis web yang membantu operator membaca kondisi tekanan kompresor, mendeteksi anomali, mencatat histori alert, serta memperoleh rekomendasi tindakan melalui AI Virtual Consultant. Aplikasi ini mengimplementasikan konsep Kecerdasan Buatan melalui analisis kondisi, reasoning berbasis aturan, simulasi gangguan, dan rekomendasi stabilisasi sistem. Dari sisi Computer Vision, aplikasi ini memiliki arah pengembangan untuk inspeksi visual plant menggunakan pengolahan citra, segmentasi, ekstraksi fitur, tracking video, dan object detection/classification, sehingga dapat mendukung kebutuhan industri dalam pemantauan perangkat Bio-CNG secara lebih cerdas dan kolaboratif.
