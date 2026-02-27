# Panduan Instalasi Buku Tamu RS Pelamonia di Google Apps Script (GAS)

Aplikasi Buku Tamu ini dirancang untuk berjalan di atas ekosistem **Google Workspace (Google Sheets, Google Drive, & Google Apps Script)**. 

Syarat utama: Anda hanya membutuhkan **Akun Google (Gmail)**. Tidak butuh server atau hosting berbayar!

Berikut adalah panduan langkah demi langkah cara memasang (deploy) aplikasi ini agar siap digunakan:

---

## TAHAP 1: Menyiapkan Database di Google Sheets

1. Buka [Google Sheets](https://sheets.google.com/) menggunakan akun Google Anda.
2. Buat spreadsheet baru (Blank/Kosong).
3. Beri nama spreadsheet tersebut, misalnya: **"Database Buku Tamu RS"**.
4. Klik menu **Extensions (Ekstensi)** > lalu pilih **Apps Script**.
5. Tab browser baru akan terbuka menampilkan editor kode Google Apps Script. 

*(Catatan: Jangan tutup tab Google Sheets Anda).*

---

## TAHAP 2: Memasukkan Kode ke Apps Script (GAS)

1. Di editor Apps Script sebelah kiri, Anda akan melihat file bernama `Code.gs`.
2. Hapus semua kode bawaan di `Code.gs` (biasanya `function myFunction() {}`), lalu **copy-paste** seluruh isi file **`Code.gs`** dari folder Anda ke dalam editor tersebut.
3. Sekarang, kita perlu menambahkan file-file HTML (tampilan web).
4. Klik tombol **`+`** di pojok kiri atas (sebelah tulisan "Files"), lalu pilih **HTML**.
5. Beri nama file baru tersebut **sama persis** dengan nama file di laptop Anda (tanpa akhiran `.html`). Ulangi langkah ini hingga Anda membuat file-file berikut:
   - `admin` (lalu paste isi dari file `admin.html`)
   - `css` (lalu paste isi dari file `css.html`)
   - `index` (lalu paste isi dari file `index.html`)
   - `js` (lalu paste isi dari file `js.html`)
   - `login` (lalu paste isi dari file `login.html`)
6. Pastikan klik ikon disket / tombol **Save project** (atau tekan `Ctrl` + `S`) setiap kali Anda selesai mem-paste kode ke masing-masing file.

---

## TAHAP 3: Setup Database & Folder Foto (Satu Kali Klik)

Aplikasi ini butuh tabel di Sheets dan folder di Drive untuk menampung foto tamu. Tenang, sudah ada skrip otomatisnya:

1. Pastikan Anda sedang membuka file `Code.gs` di editor.
2. Di baris atas (toolbar), cari menu *dropdown* di sebelah tombol `Run` (Jalankan).
3. Pilih nama fungsi **`setup`** dari daftar dropdown tersebut.
4. Klik tombol **Run (Jalankan)**.
5. **PENTING:** Google akan menampilkan jendela peringatan keamanan (Authorization Required). 
   - Klik **Review Permissions** (Tinjau Izin).
   - Pilih akun Google Anda.
   - Jika muncul peringatan "Google hasn’t verified this app" (Google belum memverifikasi aplikasi ini), klik tulisan kecil **Advanced (Lanjutan)** di kiri bawah.
   - Lalu klik tulisan **Go to Untitled project (unsafe) / Buka proyek (tidak aman)**.
   - Scroll ke bawah dan klik **Allow (Izinkan)**.
6. Cek kembali tab Google Sheets Anda. "Simsalabim", sheet master (*DATA_BUKU_TAMU, MASTER_STATUS, PENGATURAN, MASTER_RUANGAN*) otomatis terbentuk!

---

## TAHAP 4: Mempublikasikan Web App (Deploy)

Sekarang mari jadikan skrip ini sebagai website (Aplikasi Web) agar bisa diakses orang lain:

1. Di pojok kanan atas Apps Script, klik tombol biru **Deploy** > lalu pilih **New deployment**.
2. Klik ikon roda gigi (Select type) di sebelah kiri kotak, dan pastikan tercentang pilihan **Web app**.
3. Isi kolom pengaturan seperti ini:
   - **Description:** `"Versi 1.0 (Rilis Pertama)"` atau terserah Anda.
   - **Execute as:** Pilih `"Me (emailanda@gmail.com)"`.
   - **Who has access:** Pilih `"Anyone"` (PENTING: Agar orang yang tidak punya akun Gmail tetap bisa mengisi buku tamu).
4. Klik tombol biru **Deploy**.
5. Akan muncul kotak **Web app URL**. Copy dan simpan link panjang tersebut. Link tersebut adalah alamat website Buku Tamu Anda!

---

## TAHAP 5: Cara Login Akun Admin

1. Buka **Web app URL** yang baru saja Anda dapkan di browser Anda. Web akan menampilkan halaman Registrasi Tamu.
2. Untuk masuk ke Panel Admin, lihat menu sidebar di kiri dan klik **"Login Admin"**.
3. Gunakan kredensial (akun) bawaan berikut:
   - **Username:** `admin`
   - **Password:** `admin123`
4. Selamat, Anda sudah masuk! Di Panel Admin (Menu *Sistem & Pengaturan*), Anda bisa mengedit logo/judul, menambah unit ruangan, status pengunjung, dan melihat laporan statistik.

Selamat mencoba menjalankan aplikasi!
