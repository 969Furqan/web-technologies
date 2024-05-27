$(document).ready(function() {
    $.getJSON('/random-wallpapers', function(wallpapers) {
        var $carouselInner = $('#wallpaperCarousel .carousel-inner');
        $carouselInner.empty(); // Clear existing items

        wallpapers.forEach(function(wallpaper) {
            var itemHtml = `
            <div class="carousel-item">
                <img src="data:${wallpaper.img.contentType};base64,${wallpaper.img.data.toString('base64')}"
                     class="d-block" alt="${wallpaper.title}">
            </div>
            `;
            $carouselInner.append(itemHtml);
        });

        startContinuousScroll();
    });
});

function startContinuousScroll() {
    const speed = 2; // Adjust speed, pixel per frame
    const items = document.querySelectorAll('#wallpaperCarousel .carousel-item img');
    let xPos = 0;

    setInterval(() => {
        xPos -= speed;
        items.forEach(item => {
            item.style.transform = `translateX(${xPos}px)`;
            if (-xPos > item.offsetWidth) {
                xPos += item.offsetWidth;
            }
        });
    }, 20); // Adjust for smoother animation
}
