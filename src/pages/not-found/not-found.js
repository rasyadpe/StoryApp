export default function NotFoundPage() {
  document.querySelector('#main-content').innerHTML = `
    <div class="container text-center">
      <h1>404 - Page Not Found</h1>
      <p>Maaf, halaman yang Anda cari tidak ditemukan.</p>
      <p>Kembali ke <a href="#/">Halaman Utama</a></p>
    </div>
  `;
} 