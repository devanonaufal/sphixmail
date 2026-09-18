// docs.js — Sidebar navigation, smooth scroll, i18n, and theme sync
'use strict';

/* ── Anti-inspect ───────────────────────────────────── */
(function() {
  // Block right-click
  document.addEventListener('contextmenu', e => e.preventDefault());
  // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
  document.addEventListener('keydown', e => {
    if (e.key === 'F12') { e.preventDefault(); return false; }
    if (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase())) { e.preventDefault(); return false; }
    if (e.ctrlKey && e.key.toUpperCase() === 'U') { e.preventDefault(); return false; }
    if (e.metaKey && e.altKey && e.key.toUpperCase() === 'I') { e.preventDefault(); return false; }
  });
  // Detect devtools via window size threshold — blur content if opened
  const threshold = 160;
  function check() {
    const devOpen = (window.outerWidth - window.innerWidth > threshold) ||
                    (window.outerHeight - window.innerHeight > threshold);
    document.body.style.filter = devOpen ? 'blur(8px)' : '';
    document.body.style.userSelect = devOpen ? 'none' : '';
  }
  setInterval(check, 1000);
})();

// ============================================================
// i18n Translations
// ============================================================
const translations = {
  en: {
    // Navbar
    navTitle: 'Sphixmail',
    
    // Sidebar Navigation
    nav_intro: 'What is Sphixmail?',
    nav_create: 'Creating an Inbox',
    nav_receive: 'Receiving Emails',
    nav_read: 'Reading Emails',
    nav_otp: 'Auto-detect OTP',
    nav_delete: 'Deleting Inbox',
    nav_api: 'Using the API',
    nav_api_domains: 'List Domains',
    nav_api_validate: 'Validate Email',
    nav_api_messages: 'Fetch Messages',
    nav_api_delete: 'Delete Message',
    nav_api_stats: 'Statistics',
    nav_api_wait: 'Wait for OTP',
    nav_faq: 'FAQ',
    
    // Hero Section
    breadcrumb: 'Documentation',
    hero_title: 'How to Use Sphixmail',
    hero_subtitle: 'Free temporary email for OTP verification and spam-free signups — no registration required.',
    
    // Section 1: Intro
    intro_title: 'What is Sphixmail?',
    intro_p1: 'Sphixmail is a disposable temporary email service that lets you receive emails without creating an account. Perfect for:',
    intro_li1: 'Signing up for websites without revealing your real email',
    intro_li2: 'Receiving OTP verification codes instantly',
    intro_li3: 'Avoiding spam and unwanted newsletters',
    intro_li4: 'Testing email functionality in your applications',
    intro_p2: '<strong>Fast, private, and completely free.</strong> Emails arrive in seconds and are accessible via both web UI and REST API.',
    
    // Section 2: Create
    create_title: 'Creating an Inbox',
    create_intro: 'Follow these steps to create your temporary inbox:',
    create_step1: 'Open <code>sphixray.com</code> in your browser',
    create_step2: 'Choose one of these options:',
    create_step3: 'Select a domain from the dropdown (if multiple domains are available)',
    create_step4: 'If you entered a custom username, click the <strong>arrow button (→)</strong> on the right side of the input field',
    create_step5: 'Your email address is now ready to use!',
    create_note: '<strong>Note:</strong> Usernames must be alphanumeric (letters and numbers only), with a minimum of 3 characters. Some reserved words like "admin" and "root" are not allowed.',
    create_ui_title: 'Understanding the Interface',
    create_ui_desc: 'The inbox creation uses a minimal, streamlined design:',
    create_ui_input: '<strong>Input field:</strong> Enter your custom username here',
    create_ui_arrow: '<strong>Arrow button (→):</strong> Located on the right side of input — click to create inbox with your custom username',
    create_ui_random: '<strong>Random address button:</strong> Instantly generates a random Indonesian-style email address without typing',
    create_ui_domain: '<strong>Domain dropdown:</strong> Select which domain to use for your email address',
    create_smart_title: 'Smart Paste Feature',
    create_smart_p: 'If you paste a full email address (e.g., <code>user@domain.com</code>), the username and domain fields will automatically fill.',
    
    // Section 3: Receive
    receive_title: 'Receiving Emails',
    receive_p1: 'Once your inbox is created, it automatically checks for new messages every few seconds. You don\'t need to refresh manually.',
    receive_p2: 'New emails appear in the inbox list with:',
    receive_li1: 'Sender\'s email address',
    receive_li2: 'Subject line',
    receive_li3: 'Relative timestamp (e.g., "2 minutes ago")',
    
    // Section 4: Read
    read_title: 'Reading Emails',
    read_p1: 'Click any email in the list to view its contents. HTML emails are rendered safely in an isolated iframe to prevent malicious scripts.',
    read_p2: 'Timestamps are displayed in WIB timezone (Asia/Jakarta). Hover over relative time (e.g., "5 mins ago") to see the exact datetime.',
    
    // Section 5: OTP
    otp_title: 'Auto-detect OTP Codes',
    otp_p1: 'Sphixmail automatically detects verification codes in emails. When an email contains a 4-8 digit OTP, a badge appears with a one-click copy button.',
    otp_p2: 'This works for both plain text and HTML emails. Simply click the OTP badge to copy the code to your clipboard.',
    
    // Section 6: Delete
    delete_title: 'Deleting an Inbox',
    delete_p1: 'To remove an inbox from your session, click the delete icon next to the inbox address. This removes it from your view, but the address remains public.',
    delete_note: '<strong>Important:</strong> Inboxes are public by design. Anyone who knows the email address can view its messages. Only use Sphixmail for non-sensitive information like OTP codes and website verifications.',
    
    // Section 7: API
    api_title: 'Using the API',
    api_intro: 'Sphixmail provides a REST API for automation, bots, and testing workflows. You\'ll need an API key to access most endpoints. Contact the admin to request one.',
    api_base: '<strong>Base URL:</strong> <code>https://sphixray.com/pub/</code>',
    api_ref: 'For interactive documentation with live testing, visit <a href="/api-doc.html">API Reference</a>.',
    api_domains_title: 'List Active Domains',
    api_domains_desc: 'Returns all active email domains available for inbox creation.',
    api_validate_title: 'Validate Email Address',
    api_validate_desc: 'Checks if an email address is valid and follows username restrictions.',
    api_messages_title: 'Fetch Messages',
    api_messages_desc: 'Retrieves all messages for a specific inbox. Add <code>?limit=5</code> to limit results.',
    api_delete_title: 'Delete a Message',
    api_delete_desc: 'Permanently deletes a specific message by its ID.',
    api_stats_title: 'Get Statistics',
    api_stats_desc: 'Returns usage statistics. Use <code>?filters=total_messages,unread_messages</code> to filter specific metrics.',
    api_wait_title: 'Wait for OTP (Long-Polling)',
    api_wait_desc: 'Waits for an OTP email to arrive (no API key required). Ideal for automation scripts and bots.',
    response: 'Response:',
    parameters: 'Parameters:',
    
    // Section 8: FAQ
    faq_title: 'Frequently Asked Questions',
    faq_q: 'Question',
    faq_a: 'Answer',
    faq_q1: 'Are emails stored forever?',
    faq_a1: 'No. The admin can enable auto-delete to remove old messages automatically.',
    faq_q2: 'Can others read my inbox?',
    faq_a2: 'Yes, if they know the email address. Only use for OTP codes and temporary verifications.',
    faq_q3: 'How many inboxes can I create?',
    faq_a3: 'Limited per session per day (default: 10). This prevents abuse.',
    faq_q4: 'Is there a login system?',
    faq_a4: 'No. Inboxes are tied to your browser session. Clearing cookies removes access.',
    faq_q5: 'Is there a mobile app?',
    faq_a5: 'Not yet, but the website is mobile-friendly and works on all devices.',
    faq_q6: 'Why isn\'t my email arriving?',
    faq_a6: 'Ensure the domain matches. Wait a few seconds — emails typically arrive within 2-5 seconds.',
  },
  id: {
    // Navbar
    navTitle: 'Sphixmail',
    
    // Sidebar Navigation
    nav_intro: 'Apa itu Sphixmail?',
    nav_create: 'Membuat Inbox',
    nav_receive: 'Menerima Email',
    nav_read: 'Membaca Email',
    nav_otp: 'Auto-detect OTP',
    nav_delete: 'Menghapus Inbox',
    nav_api: 'Menggunakan API',
    nav_api_domains: 'Daftar Domain',
    nav_api_validate: 'Validasi Email',
    nav_api_messages: 'Ambil Pesan',
    nav_api_delete: 'Hapus Pesan',
    nav_api_stats: 'Statistik',
    nav_api_wait: 'Tunggu OTP',
    nav_faq: 'FAQ',
    
    // Hero Section
    breadcrumb: 'Dokumentasi',
    hero_title: 'Cara Pakai Sphixmail',
    hero_subtitle: 'Email temporer gratis untuk verifikasi OTP dan daftar tanpa spam — tanpa registrasi.',
    
    // Section 1: Intro
    intro_title: 'Apa itu Sphixmail?',
    intro_p1: 'Sphixmail adalah layanan email sekali pakai yang memungkinkan Anda menerima email tanpa membuat akun. Cocok untuk:',
    intro_li1: 'Daftar situs web tanpa memberikan email asli',
    intro_li2: 'Menerima kode verifikasi OTP secara instan',
    intro_li3: 'Menghindari spam dan newsletter yang tidak diinginkan',
    intro_li4: 'Testing fungsionalitas email di aplikasi Anda',
    intro_p2: '<strong>Cepat, privat, dan sepenuhnya gratis.</strong> Email tiba dalam hitungan detik dan bisa diakses via web UI maupun REST API.',
    
    // Section 2: Create
    create_title: 'Membuat Inbox',
    create_intro: 'Ikuti langkah berikut untuk membuat inbox temporer:',
    create_step1: 'Buka <code>sphixray.com</code> di browser Anda',
    create_step2: 'Pilih salah satu opsi berikut:',
    create_step3: 'Pilih domain dari dropdown (jika ada beberapa domain tersedia)',
    create_step4: 'Jika Anda memasukkan username custom, klik <strong>tombol panah (→)</strong> di sisi kanan input field',
    create_step5: 'Alamat email Anda siap digunakan!',
    create_note: '<strong>Catatan:</strong> Username hanya boleh huruf dan angka, minimal 3 karakter. Beberapa kata seperti "admin" dan "root" tidak diperbolehkan.',
    create_ui_title: 'Memahami Interface',
    create_ui_desc: 'Pembuatan inbox menggunakan desain minimal dan efisien:',
    create_ui_input: '<strong>Input field:</strong> Masukkan username custom Anda di sini',
    create_ui_arrow: '<strong>Tombol panah (→):</strong> Terletak di sisi kanan input — klik untuk membuat inbox dengan username custom Anda',
    create_ui_random: '<strong>Tombol Random address:</strong> Langsung generate alamat email bergaya nama Indonesia tanpa perlu mengetik',
    create_ui_domain: '<strong>Dropdown domain:</strong> Pilih domain mana yang akan digunakan untuk alamat email Anda',
    create_smart_title: 'Fitur Smart Paste',
    create_smart_p: 'Jika Anda paste email lengkap (misal <code>user@domain.com</code>), username dan domain akan otomatis terisi.',
    
    // Section 3: Receive
    receive_title: 'Menerima Email',
    receive_p1: 'Setelah inbox dibuat, sistem otomatis mengecek pesan baru setiap beberapa detik. Anda tidak perlu refresh manual.',
    receive_p2: 'Email baru muncul di daftar inbox dengan informasi:',
    receive_li1: 'Alamat email pengirim',
    receive_li2: 'Subjek email',
    receive_li3: 'Waktu relatif (misal "2 menit lalu")',
    
    // Section 4: Read
    read_title: 'Membaca Email',
    read_p1: 'Klik email di daftar untuk melihat isinya. Email HTML ditampilkan dengan aman dalam iframe terisolasi untuk mencegah skrip berbahaya.',
    read_p2: 'Timestamp ditampilkan dalam zona waktu WIB (Asia/Jakarta). Hover pada waktu relatif (misal "5 menit lalu") untuk melihat datetime lengkap.',
    
    // Section 5: OTP
    otp_title: 'Auto-detect Kode OTP',
    otp_p1: 'Sphixmail otomatis mendeteksi kode verifikasi dalam email. Ketika email berisi OTP 4-8 digit, badge muncul dengan tombol copy sekali klik.',
    otp_p2: 'Fitur ini bekerja untuk plain text maupun HTML email. Cukup klik badge OTP untuk menyalin kode ke clipboard.',
    
    // Section 6: Delete
    delete_title: 'Menghapus Inbox',
    delete_p1: 'Untuk menghapus inbox dari sesi Anda, klik ikon hapus di samping alamat inbox. Ini menghapusnya dari tampilan Anda, tapi alamatnya tetap publik.',
    delete_note: '<strong>Penting:</strong> Inbox bersifat publik secara desain. Siapa pun yang tahu alamatnya bisa membaca pesannya. Gunakan Sphixmail hanya untuk informasi non-sensitif seperti kode OTP dan verifikasi website.',
    
    // Section 7: API
    api_title: 'Menggunakan API',
    api_intro: 'Sphixmail menyediakan REST API untuk otomasi, bot, dan testing workflow. Anda perlu API key untuk mengakses sebagian besar endpoint. Hubungi admin untuk memintanya.',
    api_base: '<strong>Base URL:</strong> <code>https://sphixray.com/pub/</code>',
    api_ref: 'Untuk dokumentasi interaktif dengan live testing, kunjungi <a href="/api-doc.html">Referensi API</a>.',
    api_domains_title: 'Daftar Domain Aktif',
    api_domains_desc: 'Mengembalikan semua domain email aktif yang tersedia untuk pembuatan inbox.',
    api_validate_title: 'Validasi Alamat Email',
    api_validate_desc: 'Mengecek apakah alamat email valid dan mengikuti aturan username.',
    api_messages_title: 'Ambil Pesan',
    api_messages_desc: 'Mengambil semua pesan untuk inbox tertentu. Tambahkan <code>?limit=5</code> untuk membatasi hasil.',
    api_delete_title: 'Hapus Pesan',
    api_delete_desc: 'Menghapus pesan tertentu secara permanen berdasarkan ID-nya.',
    api_stats_title: 'Dapatkan Statistik',
    api_stats_desc: 'Mengembalikan statistik penggunaan. Gunakan <code>?filters=total_messages,unread_messages</code> untuk filter metrik tertentu.',
    api_wait_title: 'Tunggu OTP (Long-Polling)',
    api_wait_desc: 'Menunggu email OTP tiba (tidak perlu API key). Ideal untuk script otomasi dan bot.',
    response: 'Response:',
    parameters: 'Parameter:',
    
    // Section 8: FAQ
    faq_title: 'Pertanyaan yang Sering Diajukan',
    faq_q: 'Pertanyaan',
    faq_a: 'Jawaban',
    faq_q1: 'Apakah email tersimpan selamanya?',
    faq_a1: 'Tidak. Admin dapat mengaktifkan auto-delete untuk menghapus pesan lama secara otomatis.',
    faq_q2: 'Bisakah orang lain membaca inbox saya?',
    faq_a2: 'Ya, jika mereka tahu alamatnya. Gunakan hanya untuk kode OTP dan verifikasi temporer.',
    faq_q3: 'Berapa banyak inbox yang bisa dibuat?',
    faq_a3: 'Dibatasi per sesi per hari (default: 10). Ini untuk mencegah penyalahgunaan.',
    faq_q4: 'Apakah ada sistem login?',
    faq_a4: 'Tidak. Inbox terikat pada sesi browser Anda. Menghapus cookies akan menghapus akses.',
    faq_q5: 'Apakah ada aplikasi mobile?',
    faq_a5: 'Belum, tapi situs ini mobile-friendly dan berfungsi di semua perangkat.',
    faq_q6: 'Mengapa email saya tidak sampai?',
    faq_a6: 'Pastikan domainnya sesuai. Tunggu beberapa detik — email biasanya tiba dalam 2-5 detik.',
  }
};

// ============================================================
// Language & Theme Management
// ============================================================
let currentLang = localStorage.getItem('lang') || 'en';

function applyTranslations(lang) {
  const t = translations[lang];
  if (!t) return;
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.innerHTML = t[key];
  });
  
  // Update HTML lang attribute
  document.documentElement.lang = lang;
}

function initLanguageToggle() {
  const langEn = document.getElementById('langEn');
  const langId = document.getElementById('langId');
  
  if (!langEn || !langId) return;
  
  // Set initial state
  if (currentLang === 'id') {
    langEn.classList.remove('active');
    langId.classList.add('active');
  }
  
  langEn.addEventListener('click', () => {
    currentLang = 'en';
    localStorage.setItem('lang', 'en');
    langEn.classList.add('active');
    langId.classList.remove('active');
    applyTranslations('en');
  });
  
  langId.addEventListener('click', () => {
    currentLang = 'id';
    localStorage.setItem('lang', 'id');
    langId.classList.add('active');
    langEn.classList.remove('active');
    applyTranslations('id');
  });
}

function initThemeToggle() {
  const themeBtn = document.getElementById('themeBtn');
  if (!themeBtn) return;
  
  const updateIcon = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeBtn.textContent = isDark ? '☀️' : '🌙';
  };
  
  updateIcon();
  
  themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateIcon();
  });
}

// ============================================================
// WIB Clock (Navbar)
// ============================================================
function initClock() {
  const clockEl = document.getElementById('navClock');
  if (!clockEl) return;
  
  const updateClock = () => {
    const now = new Date();
    const wibTime = now.toLocaleTimeString('en-GB', { 
      timeZone: 'Asia/Jakarta', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    clockEl.textContent = `${wibTime} WIB`;
  };
  
  updateClock();
  setInterval(updateClock, 1000);
}

// ============================================================
// Sidebar Active Highlight on Scroll
// ============================================================
function initSidebarHighlight() {
  const navLinks = document.querySelectorAll('.docs-nav-link');
  const sections = document.querySelectorAll('.docs-section');
  
  if (!navLinks.length || !sections.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-100px 0px -66%',
    threshold: 0
  });
  
  sections.forEach(section => observer.observe(section));
}

// ============================================================
// Smooth Scroll for Anchor Links
// ============================================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ============================================================
// Starfield Background (from index.html)
// ============================================================
function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let stars = [];
  let w, h;
  
  const resize = () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  };
  
  const createStars = (count) => {
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5,
        opacity: Math.random() * 0.8 + 0.2,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2
      });
    }
  };
  
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    stars.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.fill();
      
      star.x += star.vx;
      star.y += star.vy;
      
      if (star.x < 0 || star.x > w) star.vx *= -1;
      if (star.y < 0 || star.y > h) star.vy *= -1;
    });
    requestAnimationFrame(draw);
  };
  
  resize();
  createStars(120);
  draw();
  
  window.addEventListener('resize', () => {
    resize();
    createStars(120);
  });
}

// ============================================================
// Mobile Sidebar Toggle
// ============================================================
function initMobileSidebar() {
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.docs-sidebar');
  
  if (!toggleBtn || !sidebar) return;
  
  toggleBtn.addEventListener('click', () => {
    const isHidden = sidebar.style.display === 'none';
    sidebar.style.display = isHidden ? 'block' : 'none';
  });
  
  // Close sidebar when clicking nav link (check window size dynamically)
  document.querySelectorAll('.docs-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 968) {
        sidebar.style.display = 'none';
      }
    });
  });
}

// ============================================================
// Profile Dropdown
// ============================================================
async function checkAdminSession() {
  try {
    const r = await fetch('/admin/me');
    return r.ok;
  } catch {
    return false;
  }
}

function setupProfileDropdown() {
  const profileBtn = document.getElementById('navProfileBtn');
  const profileWrap = document.getElementById('navProfileWrap');
  const logoutBtn = document.getElementById('navProfileLogout');

  if (!profileBtn || !profileWrap) return;

  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profileWrap.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!profileWrap.contains(e.target)) {
      profileWrap.classList.remove('open');
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await fetch('/admin/logout', { method: 'POST' }).catch(() => {});
      location.reload();
    });
  }
}

async function initProfileMenu() {
  const isAdmin = await checkAdminSession();
  const adminBtn = document.getElementById('navAdminBtn');
  const profileWrap = document.getElementById('navProfileWrap');
  if (isAdmin) {
    if (adminBtn) adminBtn.style.display = 'none';
    if (profileWrap) profileWrap.style.display = 'block';
    setupProfileDropdown();
  }
}

// ============================================================
// Init
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  applyTranslations(currentLang);
  initLanguageToggle();
  initThemeToggle();
  initClock();
  initSidebarHighlight();
  initSmoothScroll();
  initStarfield();
  initMobileSidebar();
  initProfileMenu();
});
