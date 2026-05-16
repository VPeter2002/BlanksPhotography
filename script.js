document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Sima görgetés szűréssel
    const links = document.querySelectorAll('nav a');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Ellenőrizzük, hogy a link belső horgony-e (vagyis '#' jellel kezdődik)
            if (href.startsWith('#')) {
                const targetElement = document.querySelector(href);
                
                if (targetElement) {
                    e.preventDefault(); // Csak belső linknél állítjuk meg az ugrást
                    
                    window.scrollTo({
                        top: targetElement.offsetTop - 70, 
                        behavior: 'smooth'
                    });
                }
            }
            // Ha nem '#' jellel kezdődik (pl. gallery.html), 
            // akkor nem fut le az e.preventDefault(), és a böngésző megnyitja az oldalt.
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
});