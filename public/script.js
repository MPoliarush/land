// script.js

function openModal(imageSrc) {
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  modal.style.display = 'block';
  modalImage.src = imageSrc;
}

function closeModal() {
  const modal = document.getElementById('imageModal');
  modal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
  const images = document.querySelectorAll('.images_container img');
  images.forEach(function (image) {
    image.addEventListener('click', function () {
      openModal(this.src);
    });
  });
});
