// This script expects a `images` array to be defined in the HTML before it is loaded.
const gallery = document.getElementById('gallery');

if (gallery && typeof images !== 'undefined') {
    images.forEach(imagePath => {
        // The image path is now expected to be complete in the `images` array.
        const container = document.createElement('div');
        container.className = 'image-container';

        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = imagePath.split('/').pop(); // Use the filename as alt text
        img.loading = 'lazy'; // Lazy load images for better performance
        img.style.cursor = 'pointer';

        container.appendChild(img);
        gallery.appendChild(container);

        // Add click event listener for modal popup
        img.addEventListener('click', () => {
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = 0;
            modal.style.left = 0;
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            modal.style.zIndex = 1000;

            const modalImg = document.createElement('img');
            modalImg.src = imagePath;
            modalImg.style.maxWidth = '90%';
            modalImg.style.maxHeight = '90%';
            modalImg.style.objectFit = 'contain';

            modal.appendChild(modalImg);
            document.body.appendChild(modal);

            // Close modal on click
            modal.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });
    });
}
