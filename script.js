document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Sima görgetés szűréssel
    const links = document.querySelectorAll('nav a');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Ha a link tartalmaz '#'-et (pl. '#about' vagy 'index.html#about')
            if (href && href.includes('#')) {
                const targetId = href.split('#')[1];
                const targetElement = document.getElementById(targetId);
                
                // Ha az elem létezik a jelenlegi oldalon
                if (targetElement) {
                    const pageUrl = href.split('#')[0];
                    const currentUrl = window.location.pathname.split('/').pop();
                    
                    // Ellenőrizzük, hogy a link erre az oldalra mutat-e (vagy csak sima '#' link)
                    if (pageUrl === '' || pageUrl === currentUrl || (pageUrl === 'index.html' && currentUrl === '')) {
                        e.preventDefault(); // Csak akkor állítjuk meg az ugrást, ha az adott oldalon vagyunk
                        
                        // Kiszámoljuk a pontos pozíciót a fix menü miatt
                        const headerOffset = 80;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        });
    });

    // 2. Elemek beúsztatása görgetésre (Scroll Reveal)
    const reveals = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;

        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    // Mobil menü vezérlése
const menuToggle = document.querySelector('#mobile-menu');
const navList = document.querySelector('.nav-list');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        // Átkapcsoljuk az 'active' és 'is-active' osztályokat
        menuToggle.classList.toggle('is-active');
        navList.classList.toggle('active');
    });
}

// Menü bezárása, ha rákattintunk egy linkre (például a horgonypontokra)
document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('is-active');
        navList.classList.remove('active');
    });
});

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); 

    // Lightbox funkcionalitás
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const galleryImages = document.querySelectorAll('.gallery-image img');

    if (lightbox && lightboxImg && closeBtn && galleryImages.length > 0) {
        galleryImages.forEach(img => {
            img.addEventListener('click', function() {
                lightbox.style.display = "block";
                lightboxImg.src = this.src;
            });
        });

        closeBtn.addEventListener('click', function() {
            lightbox.style.display = "none";
        });

        // Kattintás a lightbox hátterére is bezárja
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                lightbox.style.display = "none";
            }
        });
    }
});