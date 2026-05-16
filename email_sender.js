const form = document.getElementById("my-contact-form");
const status = document.getElementById("form-status");
const submitBtn = document.getElementById("submit-btn");

if (form) {
    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Megakadályozzuk az oldal újratöltését
        
        // Vizuális visszajelzés: a gombot letiltjuk, hogy ne lehessen kétszer kattintani
        submitBtn.disabled = true;
        submitBtn.innerText = "Küldés folyamatban...";
        status.innerText = "";
        status.className = "form-status-message";

        const data = new FormData(event.target);
        
        // !!! IDE MÁSOLD BE A FORMSPREE-TŐL KAPOTT SAJÁT LINKEDET !!!

        const formspreeUrl = "https://formspree.io/f/mdabqbba";
        

        try {
            const response = await fetch(formspreeUrl, {
                method: "POST",
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Sikeres küldés esetén
                status.innerText = "Köszönöm! Az üzenetet sikeresen elküldtük, hamarosan válaszolok.";
                status.classList.add("success");
                form.reset(); // Kiürítjük az űrlapot
            } else {
                // Ha a szerver hibát küld vissza
                const errorData = await response.json();
                status.innerText = "Hoppá! Probléma adódott a küldés során. Kérlek, próbáld újra.";
                status.classList.add("error");
            }
        } catch (error) {
            // Hálózati hiba esetén
            status.innerText = "Hálózati hiba történt. Kérlek, ellenőrizd az internetkapcsolatod.";
            status.classList.add("error");
        } finally {
            // A gombot mindenképp visszaállítjuk az eredeti állapotra
            submitBtn.disabled = false;
            submitBtn.innerText = "Üzenet küldése";
        }
    });
}